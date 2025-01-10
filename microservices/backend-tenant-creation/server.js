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
    await db.collection('tenants').doc(tenantConfig.tenantName).set(tenantConfig);
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
    const { plan, tenantName, emails } = req.body;

    switch (plan) {
      case 'free':
        console.log("free");
        // Trigger the workflow for free plan
        await triggerWorkflow(req.body);
        // Create a document for free plan
        await createTenantDocument(req.body);
        break;
      case 'standard':
        console.log("standard");
        await triggerWorkflow(req.body);
        // Create a document for standard plan
        await createTenantDocument(req.body);
        break;
      case 'enterprise':
        console.log("enterprise");
        await triggerWorkflow(req.body);
        // Create a document for enterprise plan
        await createTenantDocument(req.body);
        break;
      default:
        return res.status(400).json({
          error: 'Invalid plan selected',
        });
    }

    res.status(202).json({
      message: 'Tenant creation initiated',
      tenant: req.body.tenantName,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Tenant creation service listening on port ${port}`);
});
