import { useState } from 'react';
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
} from '@mui/material';
import { auth } from '../firebase.ts';
import { createUserWithEmailAndPassword } from '@firebase/auth';

interface AdminSignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export function AdminSignUp({ onSignUpSuccess, onSwitchToLogin }: AdminSignUpProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // First, create tenant and admin user in backend
      const response = await fetch('http://localhost:3023/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: formData.companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin account');
      }

      auth.tenantId = data.tenantId;
      localStorage.setItem('tenantId', data.tenantId);
      // Now sign in the user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Set the tenant ID in the user's custom claims
      const idToken = await userCredential.user.getIdToken(true);
      
      // Call backend to verify the signup was successful
      const verifyResponse = await fetch('http://localhost:3023/api/admin/verify-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          tenantId: data.tenantId
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signup');
      }

      onSignUpSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Card raised>
          <CardContent>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Admin Sign Up
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
              Create your admin account and company tenant
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              {onSwitchToLogin && (
                <Box textAlign="center">
                  <Link
                    component="button"
                    variant="body2"
                    onClick={onSwitchToLogin}
                    sx={{ cursor: 'pointer' }}
                  >
                    Already have an account? Login
                  </Link>
                </Box>
              )}
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
