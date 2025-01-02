import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';

const ChargingStationForm = ({ open, onClose, onSubmit, station }) => {
  const [formData, setFormData] = useState({
    location: '',
    status: 'Available',
    powerOutput: '',
    connectorType: 'Type 2',
  });

  useEffect(() => {
    if (station) {
      setFormData({
        location: station.location || '',
        status: station.status || 'Available',
        powerOutput: station.powerOutput || '',
        connectorType: station.connectorType || 'Type 2',
      });
    } else {
      setFormData({
        location: '',
        status: 'Available',
        powerOutput: '',
        connectorType: 'Type 2',
      });
    }
  }, [station]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {station ? 'Edit Charging Station' : 'Add Charging Station'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={formData.location}
            onChange={handleChange}
            required
          />
          <TextField
            select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={formData.status}
            onChange={handleChange}
            required
          >
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="In Use">In Use</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
            <MenuItem value="Out of Service">Out of Service</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="powerOutput"
            label="Power Output (kW)"
            type="number"
            fullWidth
            value={formData.powerOutput}
            onChange={handleChange}
            required
          />
          <TextField
            select
            margin="dense"
            name="connectorType"
            label="Connector Type"
            fullWidth
            value={formData.connectorType}
            onChange={handleChange}
            required
          >
            <MenuItem value="Type 1">Type 1</MenuItem>
            <MenuItem value="Type 2">Type 2</MenuItem>
            <MenuItem value="CHAdeMO">CHAdeMO</MenuItem>
            <MenuItem value="CCS">CCS</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {station ? 'Save Changes' : 'Add Station'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChargingStationForm;
