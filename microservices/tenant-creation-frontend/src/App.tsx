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
  const [emails, setEmails] = useState(['']);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userError, setUserError] = useState<string | null>(null);

  const HOST = 'http://localhost:3023/api/tenants';

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

  function selectPlan(plan: string) {
    console.log(`Selected plan: ${plan}`);
    setSelectedPlan(plan);
    setShowModal(true);
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

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
          plan: selectedPlan.toLowerCase(),
          emails: emails.filter(email => email !== '').map(email => email.toLowerCase()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tenant');
      }

      const data = await response.json();
      console.log('Tenant created:', data);
      setShowModal(false);
      setEmails(['']);
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
            <Typography variant="h3" component="h1" align="center" gutterBottom>
              Choose a Plan
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    <Button variant="contained" fullWidth onClick={() => selectPlan('free')}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    <Button variant="contained" fullWidth onClick={() => selectPlan('standard')}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    <Button variant="contained" fullWidth onClick={() => selectPlan('enterprise')}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

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
              <DialogTitle>Create Tenant</DialogTitle>
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
                  {emails.map((email, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        variant="outlined"
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveEmail(index)}
                        disabled={emails.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddEmail}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Add Email
                  </Button>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                  Create Tenant
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
