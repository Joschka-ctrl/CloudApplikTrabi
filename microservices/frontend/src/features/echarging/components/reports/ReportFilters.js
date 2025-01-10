import React from 'react';
import { Grid, Paper, TextField } from '@mui/material';

const ReportFilters = ({ startDate, endDate, selectedGarage, onStartDateChange, onEndDateChange, onGarageChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Garage"
            value={selectedGarage}
            onChange={(e) => onGarageChange(e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
