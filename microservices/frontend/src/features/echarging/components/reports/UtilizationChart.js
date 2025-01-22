import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const UtilizationChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="textSecondary">No utilization data available</Typography>
      </Box>
    );
  }

  const chartData = {
    labels: data.map(station => station.location || `Station ${station.stationId}`),
    datasets: [
      {
        label: 'Station Utilization (%)',
        data: data.map(station => station.utilization || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
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
      },
      x: {
        title: {
          display: true,
          text: 'Charging Stations'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Charging Station Utilization'
      }
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <div id="utilization-chart">
        <Typography variant="h6" gutterBottom>
          Hourly Utilization
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <Bar data={chartData} options={options} />
        </Box>
      </div>
    </Paper>
  );
};

export default UtilizationChart;
