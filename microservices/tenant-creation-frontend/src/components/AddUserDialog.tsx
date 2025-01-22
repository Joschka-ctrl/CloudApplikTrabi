import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface AddUserDialogProps {
  open: boolean;
  email: string;
  name: string;
  role: string;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
}

export const AddUserDialog = ({
  open,
  email,
  name,
  role,
  onClose,
  onEmailChange,
  onNameChange,
  onRoleChange,
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
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={(e) => onRoleChange(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="facility-manager">Facility-Manager</MenuItem>
            </Select>
          </FormControl>
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
