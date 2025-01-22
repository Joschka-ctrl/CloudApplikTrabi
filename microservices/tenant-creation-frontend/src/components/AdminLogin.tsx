import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Link,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { auth } from '../firebase.ts';
import { signInWithEmailAndPassword } from '@firebase/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignUp: () => void;
}

interface Tenant {
  id: string;
  name: string;
}

export function AdminLogin({ onLoginSuccess, onSwitchToSignUp }: AdminLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('http://localhost:3023/api/tenants');
        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        setError('Failed to load tenants');
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchTenants();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTenantChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      tenantId: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tenantId) {
      setError('Please select a tenant');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Firebase
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Set the tenantId in auth and localStorage
      auth.tenantId = formData.tenantId;
      localStorage.setItem('tenantId', formData.tenantId);

      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Admin Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="tenant-select-label">Tenant</InputLabel>
                <Select
                  labelId="tenant-select-label"
                  id="tenant-select"
                  value={formData.tenantId}
                  label="Tenant"
                  onChange={handleTenantChange}
                  disabled={loading || loadingTenants}
                  required
                >
                  {loadingTenants ? (
                    <MenuItem value="">Loading tenants...</MenuItem>
                  ) : (
                    tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || loadingTenants}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Box textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToSignUp}
                  sx={{ cursor: 'pointer' }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
