import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const StatisticsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Sessions
            </Typography>
            <Typography variant="h5">
              {stats.totalSessions}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Energy (kWh)
            </Typography>
            <Typography variant="h5">
              {stats.totalEnergy.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg. Session Duration (h)
            </Typography>
            <Typography variant="h5">
              {stats.averageSessionDuration.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg. Energy per Session (kWh)
            </Typography>
            <Typography variant="h5">
              {stats.averageEnergyPerSession.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatisticsCards;
