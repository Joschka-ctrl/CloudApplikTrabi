import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';

const RevenueCharts = ({ providerRevenue, loading }) => {
  const labels = providerRevenue ? Object.keys(providerRevenue) : [];
  const totalRevenueData = providerRevenue ? Object.values(providerRevenue).map(stats => stats.totalRevenue) : [];
  const avgRevenueData = providerRevenue ? Object.values(providerRevenue).map(stats => stats.averageRevenuePerSession) : [];

  const ChartContainer = ({ title, children }) => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : providerRevenue ? (
          children
        ) : (
          <Typography color="textSecondary">No data available</Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Paper sx={{ p: 2 }} id="revenue-chart">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartContainer title="Total Revenue by Provider">
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'Total Revenue (€)',
                    data: totalRevenueData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Total Revenue (€)'
                    }
                  }
                }
              }}
            />
          </ChartContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer title="Average Revenue per Session by Provider">
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'Average Revenue per Session (€)',
                    data: avgRevenueData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Average Revenue per Session (€)'
                    }
                  }
                }
              }}
            />
          </ChartContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RevenueCharts;
