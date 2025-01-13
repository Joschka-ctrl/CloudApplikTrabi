import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface DeleteUserDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteUserDialog = ({
  open,
  email,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Delete User</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the user <strong>{email}</strong>?
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete User
        </Button>
      </DialogActions>
    </Dialog>
  );
};
