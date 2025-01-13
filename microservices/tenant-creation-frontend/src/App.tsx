import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useState, useEffect } from 'react';
import { AdminSignUp } from './components/AdminSignUp';
import { AdminLogin } from './components/AdminLogin';
import { Navbar } from './components/Navbar';
import { auth } from './firebase';
import { onAuthStateChanged } from '@firebase/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface User {
  id: string;
  email: string;
  createdAt: string;
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userError, setUserError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const HOST = 'http://localhost:3023/api/tenants';

  const getPlanPrice = (plan: string): number => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 0;
      case 'standard':
        return 10;
      case 'enterprise':
        return 50;
      default:
        return 0;
    }
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessingPayment(false);
    setShowPaymentSuccess(true);
    // Close payment success dialog after 2 seconds and set current plan
    setTimeout(() => {
      // handleSubmit();
      setShowPaymentSuccess(false);
      setCurrentPlan(selectedPlan);
      setShowModal(false);
    }, 2000);
  };

  function selectPlan(plan: string) {
    setSelectedPlan(plan);
    setShowModal(true);
  }

  const handleChangePlan = () => {
    setChangingPlan(true);
  };

  const handleKeepCurrentPlan = () => {
    setChangingPlan(false);
  };

  // Auth state effect
  useEffect(() => {
    // Check for stored tenantId
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      auth.tenantId = storedTenantId;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch tenant details effect
  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!auth.tenantId || !isAuthenticated) {
        return;
      }

      try {
        const response = await fetch(`${HOST}/${auth.tenantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tenant details');
        }
        const data = await response.json();
        if (data.plan) {
          setCurrentPlan(data.plan.replace(/-/g, ' '));
        }
      } catch (err) {
        console.error('Error fetching tenant details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tenant details');
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    fetchTenantDetails();
  }, [isAuthenticated]);

  // Fetch users effect
  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth.tenantId) return;
      
      try {
        const response = await fetch(`${HOST}/users?tenantId=${auth.tenantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUserError(err instanceof Error ? err.message : 'Failed to fetch users');
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  if (!initialLoadComplete || loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!auth.tenantId) {
        setError('No tenant ID available');
        return;
      }

      const response = await fetch(HOST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: auth.tenantId,
          plan: selectedPlan.toLowerCase().replace(/ /g, '-'),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tenant');
      }

      const data = await response.json();
      console.log('Tenant created:', data);
      setShowModal(false);
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    }
  };

  const handleAddUser = async () => {
    try {
      setUserError(null);

      if (!auth.tenantId) {
        setUserError('No tenant ID available');
        return;
      }

      const response = await fetch(`${HOST}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: auth.tenantId,
          email: newUserEmail.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowAddUserModal(false);
      setNewUserEmail('');
    } catch (err) {
      console.error('Error adding user:', err);
      setUserError(err instanceof Error ? err.message : 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!auth.tenantId) {
        setUserError('No tenant ID available');
        return;
      }

      const response = await fetch(`${HOST}/users/${userId}?tenantId=${auth.tenantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setUserError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        {showSignUp ? (
          <AdminSignUp 
            onSignUpSuccess={() => setIsAuthenticated(true)} 
            onSwitchToLogin={() => setShowSignUp(false)}
          />
        ) : (
          <AdminLogin 
            onLoginSuccess={() => setIsAuthenticated(true)}
            onSwitchToSignUp={() => setShowSignUp(true)}
          />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}>
        <Navbar onLogout={() => setIsAuthenticated(false)} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', width: '100%' }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {!currentPlan || changingPlan ? (
              <>
                <Typography variant="h3" component="h1" align="center" gutterBottom>
                  {changingPlan ? 'Change Your Plan' : 'Choose a Plan'}
                </Typography>
                {changingPlan && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleKeepCurrentPlan}
                      startIcon={<CheckIcon />}
                    >
                      Keep Current Plan
                    </Button>
                  </Box>
                )}
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      raised 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        ...(changingPlan && currentPlan === 'free' && {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                        })
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                          Free
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          $0 / month
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Basic features for personal use.
                        </Typography>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          onClick={() => selectPlan('free')}
                          {...(changingPlan && currentPlan === 'free' && {
                            startIcon: <CheckIcon />,
                            children: 'Current Plan'
                          })}
                        >
                          {changingPlan && currentPlan === 'free' ? 'Current Plan' : 'Select'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      raised 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        ...(changingPlan && currentPlan === 'standard' && {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                        })
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                          Standard
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          $10 / month
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Advanced features for small teams.
                        </Typography>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          onClick={() => selectPlan('standard')}
                          {...(changingPlan && currentPlan === 'standard' && {
                            startIcon: <CheckIcon />,
                            children: 'Current Plan'
                          })}
                        >
                          {changingPlan && currentPlan === 'standard' ? 'Current Plan' : 'Select'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      raised 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        ...(changingPlan && currentPlan === 'enterprise' && {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                        })
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                          Enterprise
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          $50 / month
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          All features for large organizations.
                        </Typography>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          onClick={() => selectPlan('enterprise')}
                          {...(changingPlan && currentPlan === 'enterprise' && {
                            startIcon: <CheckIcon />,
                            children: 'Current Plan'
                          })}
                        >
                          {changingPlan && currentPlan === 'enterprise' ? 'Current Plan' : 'Select'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box sx={{ mt: 4 }}>
                <Card raised>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h4" gutterBottom>
                          Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${getPlanPrice(currentPlan)}/month
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangePlan}
                      >
                        Change Plan
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* User Management Section */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                User Management
              </Typography>
              {userError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {userError}
                </Alert>
              )}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddUserModal(true)}
                >
                  Add New User
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Add User Modal */}
            <Dialog open={showAddUserModal} onClose={() => setShowAddUserModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add New User</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowAddUserModal(false)}>Cancel</Button>
                <Button onClick={handleAddUser} variant="contained">
                  Add User
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Plan Details</DialogTitle>
              <DialogContent>
                <Box component="form" sx={{ mt: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    value={auth.tenantId || ''}
                    disabled
                    margin="normal"
                    variant="outlined"
                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Cost Calculation
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography>
                        Selected Plan: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${getPlanPrice(selectedPlan)}/month
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowModal(false)}>Cancel</Button>
                <Button
                  onClick={handlePayment}
                  variant="contained"
                  disabled={isProcessingPayment}
                  startIcon={isProcessingPayment ? <CircularProgress size={20} /> : null}
                >
                  {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Payment Success Dialog */}
            <Dialog
              open={showPaymentSuccess}
              aria-labelledby="payment-success-dialog"
              maxWidth="xs"
              fullWidth
            >
              <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Payment Successful!
                </Typography>
                <Typography>
                  Your tenant will be created momentarily...
                </Typography>
              </DialogContent>
            </Dialog>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
