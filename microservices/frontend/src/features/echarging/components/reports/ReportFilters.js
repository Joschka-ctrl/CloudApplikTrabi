import React from 'react';
import { Grid, Paper, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const ReportFilters = ({ 
  startDate, 
  endDate, 
  selectedGarage, 
  onStartDateChange, 
  onEndDateChange, 
  onGarageChange, 
  garages = [] 
}) => {
  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="garage-select-label">Garage</InputLabel>
            <Select
              labelId="garage-select-label"
              value={selectedGarage}
              onChange={(e) => onGarageChange(e.target.value)}
              label="Garage"
            >
              <MenuItem value="">
                <em>All Garages</em>
              </MenuItem>
              {garages.map((garage) => (
                <MenuItem key={garage.id} value={garage.id}>
                  {garage.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
