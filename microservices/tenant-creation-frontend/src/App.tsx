import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { AdminSignUp } from './components/AdminSignUp';
import { AdminLogin } from './components/AdminLogin';
import { Navbar } from './components/Navbar';
import { PlanSelection } from './components/PlanSelection';
import { CurrentPlan } from './components/CurrentPlan';
import { UserManagement } from './components/UserManagement';
import { AddUserDialog } from './components/AddUserDialog';
import { PaymentDialog } from './components/PaymentDialog';
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
  const [newUserName, setNewUserName] = useState('');
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
    await changePlan();
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessingPayment(false);
    setShowPaymentSuccess(true);
    // Close payment success dialog after 2 seconds and set current plan
    setTimeout(() => {
      setShowPaymentSuccess(false);
      setCurrentPlan(selectedPlan);
      setChangingPlan(false);
      setShowModal(false);
    }, 2000);
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleChangePlan = () => {
    setChangingPlan(true);
  };

  const handleKeepCurrentPlan = () => {
    setChangingPlan(false);
  };

  // Auth state effect
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      auth.tenantId = storedTenantId;
    }

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
        const response = await fetch(`${HOST}/${auth.tenantId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        });
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
        const response = await fetch(`${HOST}/users?tenantId=${auth.tenantId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log(data);
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

  const changePlan = async () => {
    if (isAuthenticated) {
      const plan = selectedPlan;
      const tenantId = auth.tenantId;
      if (plan && tenantId) {
        await fetch(`${HOST}/${tenantId}/changePlan`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
          body: JSON.stringify({ plan }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Plan changed successfully:', data);
          });
      } else {
        setShowSignUp(true);
      }
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
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({
          tenantId: auth.tenantId,
          email: newUserEmail.toLowerCase(),
          name: newUserName.trim(),
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
      setNewUserName('');
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

      const response = await fetch(`${HOST}/users/${userId}?tenantId=${auth.tenantId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setUserError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (!initialLoadComplete || loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

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
              <PlanSelection
                currentPlan={currentPlan}
                changingPlan={changingPlan}
                onSelectPlan={handleSelectPlan}
                onKeepCurrentPlan={handleKeepCurrentPlan}
              />
            ) : (
              <CurrentPlan
                plan={currentPlan}
                price={getPlanPrice(currentPlan)}
                onChangePlan={handleChangePlan}
                url={`https://${auth.tenantId}.trabantparking.ninja`}
              />
            )}

            <UserManagement
              users={users}
              userError={userError}
              onAddUser={() => setShowAddUserModal(true)}
              onDeleteUser={handleDeleteUser}
            />
          </Container>
        </Box>
      </Box>

      <PaymentDialog
        open={showModal}
        selectedPlan={selectedPlan}
        tenantId={auth.tenantId || ''}
        error={error}
        isProcessing={isProcessingPayment}
        onClose={() => setShowModal(false)}
        onSubmit={handlePayment}
      />

      <AddUserDialog
        open={showAddUserModal}
        email={newUserEmail}
        name={newUserName}
        onClose={() => {
          setShowAddUserModal(false);
          setNewUserEmail('');
          setNewUserName('');
        }}
        onEmailChange={setNewUserEmail}
        onNameChange={setNewUserName}
        onSubmit={handleAddUser}
      />

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
    </ThemeProvider>
  );
}

export default App;
