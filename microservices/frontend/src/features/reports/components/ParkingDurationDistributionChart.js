import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';

const ParkingDurationDistributionChart = ({ data }) => {
  if (!data || !data.durationDistribution) {
    return null;
  }

  const chartData = {
    labels: Object.keys(data.durationDistribution).map(key => `${key} hours`),
    datasets: [
      {
        label: 'Number of Vehicles',
        data: Object.values(data.durationDistribution),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Parking Duration Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Vehicles',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Duration',
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Parking Duration Statistics
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Average Duration: {data.averageDuration.toFixed(2)} hours
        </Typography>
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
};

export default ParkingDurationDistributionChart;
