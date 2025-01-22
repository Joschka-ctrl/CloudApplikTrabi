import { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import { auth } from '../firebase';

interface TenantCustomization {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

const HOST = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3023/api/tenants';

export const TenantCustomization = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [customization, setCustomization] = useState<TenantCustomization>({
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logoUrl: '',
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkTenantPlan = async () => {
      if (!auth.currentUser || initialized) return;
      
      try {
        setLoading(true);
        // First check if this tenant is enterprise
        const response = await fetch(`${HOST}/${auth.tenantId}`, {
          headers: {
            'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tenant information');
        }
        
        const tenantData = await response.json();
        const isEnterprisePlan = tenantData.plan === 'enterprise';
        setIsEnterprise(isEnterprisePlan);

        // Only fetch customization if enterprise
        if (isEnterprisePlan) {
          const customizationResponse = await fetch(`${HOST}/${auth.tenantId}/customization`, {
            headers: {
              'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
            }
          });
          
          if (!customizationResponse.ok) {
            throw new Error('Failed to fetch customization');
          }
          
          const customizationData = await customizationResponse.json();
          setCustomization(customizationData);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser && !initialized) {
      checkTenantPlan();
    }
  }, [auth.currentUser, initialized]);

  const handleChange = (field: keyof TenantCustomization) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCustomization((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    if (!auth.tenantId || !isEnterprise) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${HOST}/${auth.tenantId}/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: JSON.stringify(customization)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customization');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      setError(error instanceof Error ? error.message : 'Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!isEnterprise) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 6 }}>
        <Typography variant="h5" gutterBottom color="error">
          Customization Not Available
        </Typography>
        <Typography>
          Tenant customization is only available for Enterprise plan customers. 
          Please upgrade your plan to access these features.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Tenant Customization
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Primary Color"
          type="color"
          value={customization.primaryColor}
          onChange={handleChange('primaryColor')}
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Secondary Color"
          type="color"
          value={customization.secondaryColor}
          onChange={handleChange('secondaryColor')}
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Logo URL"
          value={customization.logoUrl}
          onChange={handleChange('logoUrl')}
          sx={{ mb: 2 }}
          helperText="Enter the URL of your company logo"
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 2 }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Customization'}
        </Button>
      </Box>
    </Paper>
  );
};
