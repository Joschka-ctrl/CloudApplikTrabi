import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box } from '@mui/material';

const SessionsChart = ({ utilizationData }) => {
  if (!utilizationData) return null;

  const chartData = {
    labels: utilizationData.map(station => station.location),
    datasets: [
      {
        label: 'Total Sessions',
        data: utilizationData.map(station => station.totalSessions),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Total Sessions by Station
      </Typography>
      <Box sx={{ height: 400 }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Sessions'
                }
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default SessionsChart;
