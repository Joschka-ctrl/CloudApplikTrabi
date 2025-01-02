import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const UtilizationChart = ({ utilizationData, loading }) => {
  const chartData = utilizationData ? {
    labels: utilizationData.map(station => station.location),
    datasets: [
      {
        label: 'Station Utilization (%)',
        data: utilizationData.map(station => station.utilization),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Station Utilization
      </Typography>
      <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Utilization (%)'
                  }
                }
              }
            }}
          />
        ) : (
          <Typography color="textSecondary">No data available</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default UtilizationChart;
