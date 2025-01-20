const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const axios = require('axios');

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

async function triggerWorkflow(tenantConfig) {
  try {
    console.log('Triggering workflow with the following details:');
    console.log('Owner:', process.env.GITHUB_OWNER);
    console.log('Repo:', process.env.GITHUB_REPO);
    console.log('Workflow ID:', 'cluster-create-k8s.yml');
    console.log('Branch/Ref:', 'stage-cluster');
    console.log('Inputs:', { tenant_name: tenantConfig.tenantName });

    await octokit.actions.createWorkflowDispatch({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      workflow_id: 'cluster-create-k8s.yml',
      ref: 'stage-cluster',
      inputs: {
        tenant_name: tenantConfig.tenantName,
      },
    });

    console.log('Workflow triggered successfully.');
    return true;
  } catch (error) {
    console.error('Error triggering workflow:', error.response?.data || error.message);
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

    // Create admin user in Firebase Auth
    const adminAuth = admin.auth().tenantManager().authForTenant(tenant.tenantId);
    const adminUser = await adminAuth.createUser({
      email: adminData.email,
      password: adminData.password,
      emailVerified: false,
      disabled: false,
      displayName: adminData.fullName,
    });

    // Set custom claims for admin user
    await adminAuth.setCustomUserClaims(adminUser.uid, {
      tenantId: tenant.tenantId,
      role: 'admin'
    });

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
async function createTenantUser(tenantId, email, name, role = 'user') {
  try {
    const tenantAuth = admin.auth().tenantManager().authForTenant(tenantId);
    const userRecord = await tenantAuth.createUser({
      email: email,
      password: tenantId,
      emailVerified: false,
      disabled: false,
      displayName: name,
    });

    // Set custom claims for user
    await tenantAuth.setCustomUserClaims(userRecord.uid, {
      tenantId: tenantId,
      role: role
    });

    // Create a user document in Firestore
    const userData = {
      id: userRecord.uid,
      email: email,
      name: name,
      tenantId: tenantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      role: role,
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

    companyNameEdit = companyName.toLowerCase().replace(/\s+/g, '-');

    if (!email || !password || !fullName || !companyNameEdit) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await createAdminUserAndTenant({
      email,
      password,
      fullName,
      companyName: companyNameEdit
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
    await admin.auth().tenantManager().authForTenant(tenantId).setCustomUserClaims(uid, {
      tenantId: tenantId,
      admin: true,
      role: 'admin'
    });

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

// Free Plan Tenant erstellen
async function handleFreePlan(tenantConfig) {
  try {

    return "free.trabantparking.ninja";
  } catch (error) {
    console.error('Error creating Free Plan Tenant:', error);
    throw error;
  }
}

async function handleStandardPlan(tenantConfig) {
  try {
    return "standard.trabantparking.ninja";
  } catch (error) {
    console.error('Error creating Standard Plan Tenant:', error);
    throw error;
  }
}

// Create new tenant endpoint
app.post('/api/tenants', authenticateToken, async (req, res) => {
  try {
    const { plan, tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    switch (plan) {
      case 'free':
        console.log("free");
        // Trigger the workflow for free plan
        await handleFreePlan({ tenantId, tenantName: tenantId });
        break;
      case 'standard':
        console.log("standard");
        await handleStandardPlan({ tenantId, tenantName: tenantId });
        // Create a document for standard plan
        // await createTenantDocument({ tenantId, plan });
        break;
      case 'enterprise':
        console.log("enterprise");
        await triggerWorkflow({ tenantName: tenantId });
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

// Get all tenants with health status
app.get('/api/tenants/allInfo', authenticateToken, async (req, res) => {
  try {
    const tenantsSnapshot = await db.collection('tenants').get();
    const tenants = [];

    for (const doc of tenantsSnapshot.docs) {
      const tenantData = doc.data();
      let status = 'pending';
      console.log(doc.id);
      let url;

      // Check if tenant has a URL (indicating deployment)
      if (tenantData.plan === 'enterprise') {
        url = `http://${doc.id}.trabantparking.ninja/`;
      } else if (tenantData.plan === 'standard') {
        url = `http://parking.trabantparking.ninja/`;
      }
      else{
        url = `http://free.trabantparking.ninja/`;
      }
        try {
          // Try to fetch the tenant's URL to check health
          const response = await axios.get(url, {
            timeout: 1000 // 5 second timeout
          });
          status = response.status === 200 ? 'healthy' : 'unhealthy';
          console.log(`Health check for tenant ${doc.id} completed with status: ${status}`);
        } catch (error) {
          console.error(`Health check failed for tenant ${doc.id}:`, error.message);
          status = 'unhealthy';
        }
      


      tenants.push({
        tenantId: doc.id,
        displayName: tenantData.displayName || doc.id,
        plan: tenantData.plan || 'free',
        status: status,
        createdAt: tenantData.createdAt ? tenantData.createdAt.toDate().toISOString() : new Date().toISOString(),
        url: tenantData.url
      });
    }

    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// get health status of a tenant
app.get('/api/tenants/health', authenticateToken, async (req, res) => {
  const tenantId = auth.tenantId;

}
);

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
app.get('/api/tenants/users', authenticateToken, async (req, res) => {
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
app.post('/api/tenants/users', authenticateToken, async (req, res) => {
  try {
    const { tenantId, email, name, role = 'user' } = req.body;

    if (!tenantId || !email) {
      return res.status(400).json({ error: 'tenantId and email are required' });
    }

    const newUser = await createTenantUser(tenantId, email, name, role);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a user from a tenant
app.delete('/api/tenants/users/:userId', authenticateToken, async (req, res) => {
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
app.get('/api/tenants/:tenantId', authenticateToken, async (req, res) => {
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

app.put('/api/tenants/:tenantId/changePlan', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { plan } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    await db.collection('tenants').doc(tenantId).set({
      plan
    });

    // Hier kommt später Joschkas workflow hin wenn Plan gewählt wird
    switch (plan) {
      case 'free':
        console.log("free");
        return await handleFreePlan({ tenantName: tenantId });
      case 'standard':
        console.log("standard");
        return await handleStandardPlan({ tenantName: tenantId });
      case 'enterprise':
        console.log("enterprise");
        await triggerWorkflow({ tenantName: tenantId });
        return `${tenantId}.trabantparking.ninja`;

      default:
        return res.status(400).json({
          error: 'Invalid plan selected',
        });
    }

  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ error: error.message });
  }
});

async function triggerDeleteWorkflow(tenantId) {
  try {
    console.log('Triggering delete workflow with the following details:');
    console.log('Owner:', process.env.GITHUB_OWNER);
    console.log('Repo:', process.env.GITHUB_REPO);
    console.log('Workflow ID:', 'destroy.yml');
    console.log('Branch/Ref:', 'stage-cluster');
    console.log('Inputs:', { tenant_name: tenantId });

    await octokit.actions.createWorkflowDispatch({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      workflow_id: 'destroy.yml',
      ref: 'stage',
      inputs: {
        tenant_name: tenantId,
      },
    });

    console.log('Delete workflow triggered successfully.');
    return true;
  } catch (error) {
    console.error('Error triggering delete workflow:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteTenantDocument(tenantId) {
  try {
    await db.collection('tenants').doc(tenantId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting tenant document:', error);
    throw error;
  }
}

async function deleteTenantFromIdentityPlatform(tenantId) {
  try {
    // Delete tenant from Identity Platform
    await admin.auth().tenantManager().deleteTenant(tenantId);
    console.log(`Successfully deleted tenant ${tenantId} from Identity Platform`);
    return true;
  } catch (error) {
    console.error('Error deleting tenant from Identity Platform:', error);
    throw error;
  }
}

// Delete tenant endpoint
app.delete('/api/tenants/:tenantId', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Check if user is a super admin
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Only super admins can delete tenants' });
    }

    // Get tenant information
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenantData = tenantDoc.data();

    // If it's an enterprise tenant, trigger the delete workflow
    if (tenantData.plan === 'enterprise') {
      try {
        await triggerDeleteWorkflow(tenantId);
      } catch (error) {
        console.error('Error triggering delete workflow:', error);
        return res.status(500).json({ error: 'Failed to trigger delete workflow' });
      }
    }

    // Delete tenant users
    const usersSnapshot = await db.collection('tenants').doc(tenantId).collection('users').get();
    const deleteUserPromises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      try {
        await deleteTenantUser(tenantId, userData.id);
        await doc.ref.delete();
      } catch (error) {
        console.error(`Error deleting user ${userData.email}:`, error);
      }
    });

    await Promise.all(deleteUserPromises);

    // Delete tenant from Identity Platform
    try {
      await deleteTenantFromIdentityPlatform(tenantId);
    } catch (error) {
      console.error('Error deleting tenant from Identity Platform:', error);
      return res.status(500).json({ error: 'Failed to delete tenant from Identity Platform' });
    }

    // Delete tenant document from Firestore
    await deleteTenantDocument(tenantId);

    res.status(200).json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Tenant creation service listening on port ${port}`);
});
