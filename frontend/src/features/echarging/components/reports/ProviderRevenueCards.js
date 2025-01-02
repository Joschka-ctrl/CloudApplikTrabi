import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const ProviderRevenueCards = ({ providerRevenue }) => {
  if (!providerRevenue) return null;

  return (
    <Grid container spacing={3}>
      {Object.entries(providerRevenue).map(([provider, stats]) => (
        <Grid item xs={12} sm={6} md={4} key={provider}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {provider}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Revenue
              </Typography>
              <Typography variant="h6" gutterBottom>
                €{stats.totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Sessions
              </Typography>
              <Typography variant="h6" gutterBottom>
                {stats.totalSessions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Energy (kWh)
              </Typography>
              <Typography variant="h6" gutterBottom>
                {stats.totalEnergy.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rate per kWh
              </Typography>
              <Typography variant="h6">
                €{stats.ratePerKw.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Revenue/Session
              </Typography>
              <Typography variant="h6" gutterBottom>
                €{stats.averageRevenuePerSession.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProviderRevenueCards;
