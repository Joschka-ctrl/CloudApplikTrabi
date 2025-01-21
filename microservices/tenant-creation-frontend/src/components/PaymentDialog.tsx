import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';

interface PaymentDialogProps {
  open: boolean;
  selectedPlan: string;
  tenantId: string;
  error: string | null;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const getPlanPrice = (plan: string): number => {
  switch (plan.toLowerCase()) {
    case 'free':
      return 0;
    case 'pro':
      return 10;
    case 'enterprise':
      return 50;
    default:
      return 0;
  }
};

export const PaymentDialog = ({
  open,
  selectedPlan,
  tenantId,
  error,
  isProcessing,
  onClose,
  onSubmit,
}: PaymentDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            value={tenantId}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
