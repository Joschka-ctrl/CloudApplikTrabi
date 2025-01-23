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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminSignUp } from './components/AdminSignUp';
import { AdminLogin } from './components/AdminLogin';
import { Navbar } from './components/Navbar';
import { PlanSelection } from './components/PlanSelection';
import { CurrentPlan } from './components/CurrentPlan';
import { UserManagement } from './components/UserManagement';
import { AddUserDialog } from './components/AddUserDialog';
import { PaymentDialog } from './components/PaymentDialog';
import { TenantCustomization } from './components/TenantCustomization';
import SuperAdmin from './pages/super-admin';
import { auth } from './firebase';
import { User } from './types/User';
import { useAuth } from './hooks/useAuth';

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

function App() {
  const { isAuthenticated, loading: authLoading, error: authError, initialLoadComplete, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [userError, setUserError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [deploymentStatus, setDeploymentStatus] = useState<'pending' | 'deployed' | 'failed'>('pending');

  const HOST = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3023/api/tenants';

  const getPlanPrice = (plan: string): number => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 0;
      case 'professional':
        return 10;
      case 'enterprise':
        return 50;
      default:
        return 0;
    }
  };

  const generateTenantUrl = (plan: string, tenantId: string | null): string => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 'http://free.trabantparking.ninja';
      case 'professional':
        return 'http://professional.trabantparking.ninja';
      case 'enterprise':
        return `http://${tenantId}.trabantparking.ninja`;
      default:
        return '';
    }
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    changePlan();
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

  const checkDeploymentStatus = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'HEAD'
      });

      if (response.status === 500) {
        setDeploymentStatus('failed');
      } else if (response.ok) {
        setDeploymentStatus('deployed');
      } else {
        setDeploymentStatus('pending');
      }
    } catch (error) {
      setDeploymentStatus('pending');
    }
  };

  // Fetch tenant details effect
  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!auth.tenantId || !isAuthenticated) {
        setPlanLoading(false);
        return;
      }

      try {
        setPlanLoading(true);
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
        setPlanLoading(false);
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

  // Effect to check deployment status every 15 seconds
  useEffect(() => {
    if (!currentPlan) return;

    const url = generateTenantUrl(currentPlan, auth.tenantId);
    if (!url) return;

    const checkStatus = () => checkDeploymentStatus(url);
    checkStatus(); // Initial check

    const intervalId = setInterval(checkStatus, 15000);

    return () => clearInterval(intervalId);
  }, [currentPlan, auth.tenantId]);

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
            return data;
          });
      } else {
        setShowSignUp(true);
        return;
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
          role: newUserRole,
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
      setNewUserRole('user');
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

  if (!initialLoadComplete || authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

  const MainContent = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {planLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : !currentPlan || changingPlan ? (
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
          url={generateTenantUrl(currentPlan, auth.tenantId)}
          deploymentStatus={deploymentStatus}
        />
      )}
      <UserManagement
        users={users}
        userError={userError}
        onAddUser={() => setShowAddUserModal(true)}
        onDeleteUser={handleDeleteUser}
      />
      <TenantCustomization/>
    </Container>
  );

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 2
          }}>
            {authError && (
              <Box sx={{ mb: 3 }}>
                <Typography color="error" align="center" gutterBottom>
                  {authError}
                </Typography>
              </Box>
            )}
            {showSignUp ? (
              <AdminSignUp
                onSignUpSuccess={() => setShowSignUp(false)}
                onSwitchToLogin={() => setShowSignUp(false)}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => null}
                onSwitchToSignUp={() => setShowSignUp(true)}
              />
            )}
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
        }}>
          <Navbar onLogout={logout} />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', width: '100%' }}>
            <Routes>
              <Route path="/super-admin" element={<SuperAdmin />} />
              <Route path="/" element={<MainContent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
          role={newUserRole}
          onClose={() => {
            setShowAddUserModal(false);
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('user');
          }}
          onEmailChange={setNewUserEmail}
          onNameChange={setNewUserName}
          onRoleChange={setNewUserRole}
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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
