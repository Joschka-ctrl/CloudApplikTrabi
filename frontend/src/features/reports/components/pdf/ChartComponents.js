import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

// Data formatting functions
const formatDailyUsageData = (data) => {
  if (!data || !data.labels || !data.datasets) return null;
  return {
    labels: data.labels,
    datasets: data.datasets
  };
};

const formatDurationData = (data) => {
  if (!data || !data.labels || !data.data) return null;
  return {
    labels: data.labels,
    datasets: [{
      label: 'Number of Vehicles',
      data: data.data,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
};

const formatRevenueData = (data) => {
  if (!data || !data.labels || !data.data) return null;
  return {
    labels: data.labels,
    datasets: [{
      label: 'Revenue',
      data: data.data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false
    }]
  };
};

const formatFloorOccupancyData = (data) => {
  if (!data || !data.labels || !data.data) return null;
  return {
    labels: data.labels,
    datasets: [
      {
        label: 'Occupied Spots',
        data: data.data,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Available Spots',
        // Calculate available spots as the difference between total (10) and occupied
        data: data.data.map(occupied => 10 - occupied),
        backgroundColor: 'rgba(200, 200, 200, 0.8)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 1,
      }
    ]
  };
};

const formatFloorUsageData = (data) => {
  if (!data || !data.labels || !data.data) return null;
  return {
    labels: data.labels,
    datasets: [{
      label: 'Usage Count',
      data: data.data,
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };
};

export const PDFDailyUsageChart = ({ data }) => {
  const chartData = formatDailyUsageData(data);
  if (!chartData) return null;
  
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: {
                color: '#E5E5E5'
              }
            },
            x: {
              grid: {
                color: '#E5E5E5'
              }
            }
          }
        }}
      />
    </div>
  );
};

export const PDFDurationChart = ({ data }) => {
  const chartData = formatDurationData(data);
  if (!chartData) return null;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: {
                color: '#E5E5E5'
              }
            },
            x: {
              grid: {
                color: '#E5E5E5'
              }
            }
          }
        }}
      />
    </div>
  );
};

export const PDFRevenueChart = ({ data }) => {
  const chartData = formatRevenueData(data);
  if (!chartData) return null;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: {
                color: '#E5E5E5'
              }
            },
            x: {
              grid: {
                color: '#E5E5E5'
              }
            }
          }
        }}
      />
    </div>
  );
};

export const PDFFloorOccupancyChart = ({ data }) => {
  const chartData = formatFloorOccupancyData(data);
  if (!chartData) return null;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <Bar
        data={chartData}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: {
            padding: {
              bottom: 20
            }
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Number of Spots'
              },
              ticks: {
                stepSize: 1
              }
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: 'Floor'
              },
              reverse: true
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                padding: 15
              }
            }
          }
        }}
      />
    </div>
  );
};

export const PDFFloorUsageChart = ({ data }) => {
  const chartData = formatFloorUsageData(data);
  if (!chartData) return null;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: {
                color: '#E5E5E5'
              }
            },
            x: {
              grid: {
                color: '#E5E5E5'
              }
            }
          }
        }}
      />
    </div>
  );
};
