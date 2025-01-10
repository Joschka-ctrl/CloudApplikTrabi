import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Container,
} from '@mui/material';
import { signOut } from '@firebase/auth';
import { auth } from '../firebase';

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('tenantId');
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ width: '100vw', left: 0 }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '.1rem'
            }}
          >
            Tenant Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {auth.tenantId && (
              <Chip
                label={`Tenant: ${auth.tenantId}`}
                color="secondary"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 500,
                }}
              />
            )}
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
