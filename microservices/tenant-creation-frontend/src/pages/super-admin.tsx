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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StopIcon from '@mui/icons-material/Stop';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [tenantToStop, setTenantToStop] = useState<Tenant | null>(null);
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

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to delete a tenant');
        return;
      }

      const idToken = await currentUser.getIdToken();
      await axios.delete(`http://localhost:3023/api/tenants/${tenantToDelete.tenantId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      setTenants(tenants.filter(t => t.tenantId !== tenantToDelete.tenantId));
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (err: any) {
      console.error('Error deleting tenant:', err);
      setError(err.response?.data?.error || 'Failed to delete tenant');
      if (err.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTenantToDelete(null);
  };

  const handleStopClick = (tenant: Tenant) => {
    setTenantToStop(tenant);
    setStopDialogOpen(true);
  };

  const handleStopConfirm = async () => {
    if (!tenantToStop) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to stop a tenant');
        return;
      }

      const idToken = await currentUser.getIdToken();
      await axios.post(`http://localhost:3023/api/tenants/stop`, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      setStopDialogOpen(false);
      setTenantToStop(null);
    } catch (err: any) {
      console.error('Error stopping tenant:', err);
      setError(err.response?.data?.error || 'Failed to stop tenant');
      if (err.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleStopCancel = () => {
    setStopDialogOpen(false);
    setTenantToStop(null);
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>stage free + stage pro</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell> <a href="http://stage-free.trabantparking.ninja" target="_blank" rel="noopener noreferrer">
                          http://stage-free.trabantparking.ninja
                        </a></TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleStopClick({ tenantId: 'free', displayName: 'Free', plan: 'free', status: 'healthy', createdAt: '' })}
                      color="warning"
                      size="small"
                      aria-label="stop tenant"
                    >
                      <StopIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
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
                        <a href={`${tenant.url}`} target="_blank" rel="noopener noreferrer">
                          {tenant.url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteClick(tenant)}
                        color="error"
                        size="small"
                        aria-label="delete tenant"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Tenant</DialogTitle>
          <DialogContent>
            Are you sure you want to delete tenant "{tenantToDelete?.displayName}"? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={stopDialogOpen}
          onClose={handleStopCancel}
        >
          <DialogTitle>Stop Tenant</DialogTitle>
          <DialogContent>
            Are you sure you want to stop tenant "{tenantToStop?.displayName}"? The tenant will be temporarily deactivated.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStopCancel}>Cancel</Button>
            <Button onClick={handleStopConfirm} color="warning">Stop</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}