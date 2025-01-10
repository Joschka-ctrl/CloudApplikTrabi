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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { AdminSignUp } from './components/AdminSignUp';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [emails, setEmails] = useState(['']);
  const [isAdminSignedUp, setIsAdminSignedUp] = useState(false);

  const HOST = 'http://localhost:3023/api/tenants';

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

  const handleSubmit = () => {
    console.log({
      tenantName,
      selectedPlan,
      emails: emails.filter(email => email !== ''),
    });

    fetch(HOST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantName: tenantName.toLowerCase(),
        plan: selectedPlan.toLowerCase(),
        emails: emails.filter(email => email !== '').map(email => email.toLowerCase()),
      }),
    });

    setShowModal(false);
    setTenantName('');
    setEmails(['']);
  };

  if (!isAdminSignedUp) {
    return (
      <ThemeProvider theme={theme}>
        <AdminSignUp onSignUpSuccess={() => setIsAdminSignedUp(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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

        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Tenant</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tenant Name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                margin="normal"
                variant="outlined"
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
    </ThemeProvider>
  );
}

export default App;
