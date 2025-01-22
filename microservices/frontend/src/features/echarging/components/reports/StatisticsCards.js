import React from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';

const StatisticsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Grid>
      </Grid>
    );
  }

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
              {stats.totalSessions || 0}
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
              {(stats.totalEnergy || 0).toFixed(2)}
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
              {(stats.averageSessionDuration || 0).toFixed(2)}
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
              {(stats.averageEnergyPerSession || 0).toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatisticsCards;
