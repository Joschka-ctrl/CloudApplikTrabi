import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface AddUserDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
}

export const AddUserDialog = ({
  open,
  email,
  onClose,
  onEmailChange,
  onSubmit,
}: AddUserDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          margin="normal"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};
