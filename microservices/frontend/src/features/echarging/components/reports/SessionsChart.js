import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const SessionsChart = ({ utilizationData, loading }) => {
  const chartData = utilizationData ? {
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
  } : null;

  return (
    <Paper sx={{ p: 2 }}>
      <div id="sessions-chart">
        <Typography variant="h6" gutterBottom>
          Daily Sessions
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
                  title: {
                    display: true,
                    text: 'Number of Sessions'
                  }
                }
              }
            }}
          />
        ) : (
          <Typography color="textSecondary">No data available</Typography>
        )}
      </Box>
      </div>
    </Paper>
  );
};

export default SessionsChart;
