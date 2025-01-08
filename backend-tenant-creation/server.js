const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub client initialization
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Validation schema for tenant creation
const tenantSchema = Joi.object({
  tenantName: Joi.string().required().min(3).max(50),
  adminEmail: Joi.string().email().required(),
  region: Joi.string().required(),
  resources: Joi.object({
    cpu: Joi.string().required(),
    memory: Joi.string().required(),
    storage: Joi.string().required()
  }).required()
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
        region: tenantConfig.region,
        cpu_request: tenantConfig.resources.cpu,
        memory_request: tenantConfig.resources.memory,
        storage_request: tenantConfig.resources.storage
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
    // Validate request body
    const { error, value } = tenantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Trigger the workflow
    await triggerWorkflow(value);

    res.status(202).json({
      message: 'Tenant creation initiated',
      tenant: value.tenantName,
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
