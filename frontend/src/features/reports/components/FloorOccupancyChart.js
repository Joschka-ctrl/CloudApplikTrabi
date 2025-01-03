import React from 'react';
import { Pie } from 'react-chartjs-2';

const FloorOccupancyChart = ({ data, floorStats, selectedParkingPlace, startDate, endDate }) => {
  if (!data || !floorStats) return null;

  return (
    <div className="grid-item chart">
      <h2>Occupancy by Floor</h2>
      <Pie 
        key={`occupancy-${selectedParkingPlace}-${startDate}-${endDate}`}
        data={data}
        options={{
          responsive: true,
          animation: { duration: 750 },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                generateLabels: (chart) => {
                  const chartData = chart.data;
                  if (chartData.labels.length && chartData.datasets.length) {
                    return chartData.labels.filter((_, i) => i % 2 === 0).map((label, i) => ({
                      text: label,
                      fillStyle: chartData.datasets[0].backgroundColor[i * 2],
                      hidden: false,
                      index: i
                    }));
                  }
                  return [];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const floorData = floorStats.floorStats[Math.floor(context.dataIndex / 2)];
                  if (context.dataIndex % 2 === 0) {
                    return [
                      `Occupied: ${floorData.occupancyPercentage}%`,
                      `Spots: ${floorData.occupiedSpots}/${floorData.totalSpots}`
                    ];
                  }
                  return [
                    `Available: ${100 - floorData.occupancyPercentage}%`,
                    `Spots: ${floorData.totalSpots - floorData.occupiedSpots}/${floorData.totalSpots}`
                  ];
                }
              }
            }
          }
        }}
      />
    </div>
  );
};

export default FloorOccupancyChart;
