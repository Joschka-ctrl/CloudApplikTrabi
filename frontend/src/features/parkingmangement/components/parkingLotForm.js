import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const ParkingLotForm = ({ open, onClose, onSave, lot }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (lot) {
      setName(lot.name || '');
      setCapacity(lot.capacity || '');
      setLocation(lot.location || '');
    } else {
      setName('');
      setCapacity('');
      setLocation('');
    }
  }, [lot]);

  const handleSave = () => {
    onSave({ name, capacity, location });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{lot ? 'Edit Parking Lot' : 'Add Parking Lot'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Capacity"
          type="number"
          fullWidth
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Location"
          type="text"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParkingLotForm;
