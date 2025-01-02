import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';

const ChargingStationForm = ({ open, onClose, onSave, station }) => {
  const [formData, setFormData] = useState({
    location: '',
    power: '',
    connectorType: '',
    status: 'available',
    garage: ''
  });

  useEffect(() => {
    if (station) {
      setFormData({
        location: station.location || '',
        power: station.power || '',
        connectorType: station.connectorType || '',
        status: station.status || 'available',
        garage: station.garage || ''
      });
    } else {
      setFormData({
        location: '',
        power: '',
        connectorType: '',
        status: 'available',
        garage: ''
      });
    }
  }, [station]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      location: '',
      power: '',
      connectorType: '',
      status: 'available',
      garage: ''
    });
  };

  const connectorTypes = [
    'Type 2',
    'CCS',
    'CHAdeMO',
    'Type 1'
  ];

  const statusOptions = [
    'available',
    'occupied',
    'maintenance'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {station ? 'Edit Charging Station' : 'Add New Charging Station'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Garage"
                name="garage"
                value={formData.garage}
                onChange={handleChange}
                required
                helperText="Enter the garage name where this station is located"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Power (kW)"
                name="power"
                type="number"
                value={formData.power}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Connector Type"
                name="connectorType"
                value={formData.connectorType}
                onChange={handleChange}
                required
              >
                {connectorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {station ? 'Save Changes' : 'Add Station'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChargingStationForm;
