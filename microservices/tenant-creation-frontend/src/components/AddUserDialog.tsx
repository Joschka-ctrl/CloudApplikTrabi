import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface AddUserDialogProps {
  open: boolean;
  email: string;
  name: string;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export const AddUserDialog = ({
  open,
  email,
  name,
  onClose,
  onEmailChange,
  onNameChange,
  onSubmit,
}: AddUserDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter user's name"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter user's email"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained"
          disabled={!email.trim() || !name.trim()}
        >
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};
