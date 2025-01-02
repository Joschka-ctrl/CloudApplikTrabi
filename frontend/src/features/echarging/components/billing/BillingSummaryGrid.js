import React from 'react';
import { Paper, Typography, Grid, Card, CardContent } from '@mui/material';

const BillingSummaryGrid = ({ billingSummary }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Billing Summary
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(billingSummary).map(([provider, data]) => (
          <Grid item xs={12} sm={6} md={4} key={provider}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {provider}
                </Typography>
                {data.garage && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Garage: {data.garage}
                  </Typography>
                )}
                <Typography variant="body1">
                  Total Sessions: {data.sessions}
                </Typography>
                <Typography variant="body1">
                  Total Energy: {data.totalEnergy.toFixed(2)} kWh
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
                  Revenue: {data.totalAmount.toFixed(2)} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default BillingSummaryGrid;
