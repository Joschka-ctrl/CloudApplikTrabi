import React from 'react';
import { Paper, Typography, Box, Grid, TextField, Button } from '@mui/material';

const ProviderRatesForm = ({ newRate, setNewRate, onSubmit }) => {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add/Update Provider Rate
      </Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Provider Name"
              value={newRate.provider}
              onChange={(e) => setNewRate({ ...newRate, provider: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Rate per kW (€)"
              type="number"
              step="0.01"
              value={newRate.ratePerKw}
              onChange={(e) => setNewRate({ ...newRate, ratePerKw: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ height: '56px' }}
            >
              Save Rate
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProviderRatesForm;
