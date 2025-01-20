import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  tenantId: string;
  displayName: string;
  plan: string;
  status: string;
  createdAt: string;
  url?: string;
}

export default function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('No user logged in');
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:3023/api/tenants/allInfo', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (Array.isArray(response.data)) {
          setTenants(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Received invalid data from server');
        }
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        setError(err.response?.data?.error || 'Failed to fetch tenants');
        if (err.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tenant Overview
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!error && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant ID</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.tenantId}>
                    <TableCell>{tenant.tenantId}</TableCell>
                    <TableCell>{tenant.displayName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={tenant.plan} 
                        size="small"
                        color={tenant.plan === 'enterprise' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tenant.status} 
                        size="small"
                        color={getStatusColor(tenant.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {tenant.url ? (
                        <a href={`https://${tenant.url}`} target="_blank" rel="noopener noreferrer">
                          {tenant.url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}