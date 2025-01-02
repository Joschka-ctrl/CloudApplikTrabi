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
    status: 'available'
  });

  useEffect(() => {
    if (station) {
      setFormData({
        location: station.location || '',
        power: station.power || '',
        connectorType: station.connectorType || '',
        status: station.status || 'available'
      });
    } else {
      setFormData({
        location: '',
        power: '',
        connectorType: '',
        status: 'available'
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
      status: 'available'
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
          {station ? 'Edit Charging Station' : 'Add Charging Station'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="power"
                label="Power (kW)"
                type="number"
                value={formData.power}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="connectorType"
                label="Connector Type"
                select
                value={formData.connectorType}
                onChange={handleChange}
                fullWidth
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
                name="status"
                label="Status"
                select
                value={formData.status}
                onChange={handleChange}
                fullWidth
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
