const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
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

// Create new tenant endpoint
app.post('/api/tenants', async (req, res) => {
  try {
    const { plan, tenantName, emails } = req.body;

    switch (plan) {
      case 'free':
        console.log("free");
        // Trigger the workflow for free plan
        await triggerWorkflow(req.body);
        break;
      case 'standard':
        console.log("standard");
        await triggerWorkflow(req.body);
        break;
      case 'enterprise':
        console.log("enterprise");
        await triggerWorkflow(req.body);
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Tenant creation service listening on port ${port}`);
});
