import React from 'react';
import { Bar } from 'react-chartjs-2';

const FloorOccupancyChart = ({ floorStats, selectedParkingPlace, startDate, endDate }) => {
  if (!floorStats) return null;

  const chartData = {
    labels: floorStats.floorStats.map(floor => `Floor ${floor.floor}`),
    datasets: [
      {
        label: 'Occupied Spots',
        data: floorStats.floorStats.map(floor => floor.occupiedSpots),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Available Spots',
        data: floorStats.floorStats.map(floor => floor.totalSpots - floor.occupiedSpots),
        backgroundColor: 'rgba(200, 200, 200, 0.8)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750 },
    layout: {
      padding: {
        bottom: 20 // Add padding at the bottom for the legend
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
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const floor = floorStats.floorStats[context.dataIndex];
            const datasetLabel = context.dataset.label;
            const value = context.raw;
            
            if (datasetLabel === 'Occupied Spots') {
              return `Occupied: ${value} spots (${floor.occupancyPercentage}%)`;
            }
            return `Available: ${value} spots`;
          }
        }
      }
    }
  };

  return (
    <div className="grid-item chart" style={{ 
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px'
    }}
    id='floor-occupancy-chart'
    >
      <h2 style={{ marginBottom: '16px' }}>Occupancy by Floor</h2>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <Bar 
          key={`occupancy-${selectedParkingPlace}-${startDate}-${endDate}`}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
};

export default FloorOccupancyChart;
