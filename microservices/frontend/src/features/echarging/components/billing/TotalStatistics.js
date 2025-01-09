import React from 'react';
import { Grid, Paper, Typography, Card, CardContent, Box } from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import EuroIcon from '@mui/icons-material/Euro';

const TotalStatistics = ({ totalStats }) => {
  return (
    <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
            Total Statistics
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ElectricBoltIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Energy</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {totalStats.energy.toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {totalStats.sessions} sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EuroIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {totalStats.revenue.toFixed(2)} €
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average: {(totalStats.revenue / totalStats.sessions || 0).toFixed(2)} € per session
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ElectricBoltIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Average Consumption</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {(totalStats.energy / totalStats.sessions || 0).toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per charging session
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TotalStatistics;
