const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3023;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub client initialization
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

//admin.firestore().settings({
//  databaseId: "tenants",
//});


// Middleware zur Authentifizierung
const authenticateToken = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith('Bearer ')) {
    console.log('Unauthorized access attempt detected');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log('Token of user ' + decodedToken.uid + ' verified successfully');
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Trigger GitHub Actions workflow
async function triggerWorkflow(tenantConfig) {
  try {
    await octokit.actions.createWorkflowDispatch({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      workflow_id: 'gcp-k8s-deploy.yml',
      ref: 'kubernetes-creation-pipeline',
      inputs: {
        tenant_name: tenantConfig.tenantName,
      }
    });
    return true;
  } catch (error) {
    console.error('Error triggering workflow:', error);
    throw error;
  }
}

async function createTenantDocument(tenantConfig) {
  try {
    if (!tenantConfig.tenantId) {
      throw new Error('tenantId is required');
    }
    await db.collection('tenants').doc(tenantConfig.tenantId).set(tenantConfig);
    return true;
  } catch (error) {
    console.error('Error creating tenant document:', error);
    throw error;
  }
}

// Create admin user and tenant
async function createAdminUserAndTenant(adminData) {
  try {
    // Create tenant in Identity Platform first
    const tenantConfig = {
      displayName: adminData.companyName,
      emailSignInConfig: {
        enabled: true,
        passwordRequired: false,
      },
    };
    
    const tenant = await admin.auth().tenantManager().createTenant(tenantConfig);

    // Create tenant document in Firestore
    const tenantData = {
      tenantId: tenant.tenantId,
      companyName: adminData.companyName,
      adminEmail: adminData.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      plan: adminData.plan || 'standard',
      status: 'active'
    };

    await db.collection('tenants').doc(tenant.tenantId).set(tenantData);

    return {
      tenantId: tenant.tenantId,
      success: true
    };
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

// Helper function to create a user in Firebase Auth
async function createTenantUser(tenantId, email) {
  try {
    const tenantAuth = admin.auth().tenantManager().authForTenant(tenantId);
    const userRecord = await tenantAuth.createUser({
      email: email,
      password: tenantId,
      emailVerified: false,
      disabled: false,
    });

    // Create a user document in Firestore
    const userData = {
      id: userRecord.uid,
      email: email,
      tenantId: tenantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    };

    await db.collection('tenants').doc(tenantId).collection('users').doc(userRecord.uid).set(userData);

    return {
      ...userData,
      createdAt: new Date().toISOString() // Convert to ISO string for frontend
    };
  } catch (error) {
    console.error('Error creating tenant user:', error);
    throw error;
  }
}

// Helper function to delete a user from Firebase Auth
async function deleteTenantUser(tenantId, userId) {
  try {
    const tenantAuth = admin.auth().tenantManager().authForTenant(tenantId);
    await tenantAuth.deleteUser(userId);
    
    // Delete user document from Firestore
    await db.collection('tenants').doc(tenantId).collection('users').doc(userId).delete();

    return true;
  } catch (error) {
    console.error('Error deleting tenant user:', error);
    throw error;
  }
}

// Admin sign-in and tenant creation endpoint
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;

    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await createAdminUserAndTenant({
      email,
      password,
      fullName,
      companyName
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in signup endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify signup and set custom claims
app.post('/api/admin/verify-signup', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.body;
    const uid = req.user.uid;
    console.log('Tenant ID:', tenantId);
    console.log('UID:', uid);

    if (!tenantId) {
      return res.status(400).json({ message: 'Missing tenant ID' });
    }

    // Set custom claims for admin
    /*
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      tenantId: tenantId
    });*/

    // Update tenant document with admin UID
    await db.collection('tenants').doc(tenantId).update({
      adminUid: uid
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in verify-signup endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new tenant endpoint
app.post('/api/tenants', async (req, res) => {
  try {
    const { plan, tenantId, emails } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    switch (plan) {
      case 'free':
        console.log("free");
        // Trigger the workflow for free plan
        await triggerWorkflow({ tenantId, tenantName: tenantId });
        // Create a document for free plan
        await createTenantDocument({ tenantId, plan });
        break;
      case 'standard':
        console.log("standard");
        await triggerWorkflow({ tenantId, tenantName: tenantId });
        // Create a document for standard plan
        await createTenantDocument({ tenantId, plan });
        break;
      case 'enterprise':
        console.log("enterprise");
        await triggerWorkflow({ tenantId, tenantName: tenantId });
        // Create a document for enterprise plan
        await createTenantDocument({ tenantId, plan });
        break;
      default:
        return res.status(400).json({
          error: 'Invalid plan selected',
        });
    }

    res.status(202).json({
      message: 'Tenant creation initiated',
      tenant: tenantId,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      error: 'Failed to create tenant',
      details: error.message
    });
  }
});

// Get all tenants endpoint
app.get('/api/tenants', async (req, res) => {
  try {
    const tenantsSnapshot = await db.collection('tenants').get();
    const tenants = [];
    
    tenantsSnapshot.forEach(doc => {
      tenants.push({
        id: doc.id,
        name: doc.data().companyName || doc.id, // Use companyName if available, fallback to id
      });
    });

    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get all users for a tenant
app.get('/api/tenants/users', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const usersSnapshot = await db.collection('tenants').doc(tenantId).collection('users').get();
    const users = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        ...userData,
        createdAt: userData.createdAt.toDate().toISOString()
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new user to a tenant
app.post('/api/tenants/users', async (req, res) => {
  try {
    const { tenantId, email } = req.body;

    if (!tenantId || !email) {
      return res.status(400).json({ error: 'tenantId and email are required' });
    }

    const newUser = await createTenantUser(tenantId, email);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a user from a tenant
app.delete('/api/tenants/users/:userId', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { userId } = req.params;

    if (!tenantId || !userId) {
      return res.status(400).json({ error: 'tenantId and userId are required' });
    }

    await deleteTenantUser(tenantId, userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tenant details
app.get('/api/tenants/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    
    if (!tenantDoc.exists) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenantData = tenantDoc.data();
    res.status(200).json(tenantData);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Tenant creation service listening on port ${port}`);
});
