import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';

const RevenueCharts = ({ providerRevenue }) => {
  if (!providerRevenue) return null;

  const labels = Object.keys(providerRevenue);
  const totalRevenueData = Object.values(providerRevenue).map(stats => stats.totalRevenue);
  const avgRevenueData = Object.values(providerRevenue).map(stats => stats.averageRevenuePerSession);

  return (
    <>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Revenue by Provider
          </Typography>
          <Box sx={{ height: 400 }}>
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
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Revenue per Session by Provider
          </Typography>
          <Box sx={{ height: 400 }}>
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
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

export default RevenueCharts;
