import React from 'react';
import { Bar } from 'react-chartjs-2';

const FloorUsagePatternChart = ({ floorStats, selectedParkingPlace, startDate, endDate }) => {
  if (!floorStats) return null;

  return (
    <div className="grid-item chart">
      <h2>Floor Usage Patterns</h2>
      <Bar
        key={`floor-patterns-${selectedParkingPlace}-${startDate}-${endDate}`}
        data={{
          labels: floorStats.floorStats?.map(f => `Floor ${f.floor}`),
          datasets: [{
            label: 'Average Occupancy Rate',
            data: floorStats.floorStats?.map(f => f.averageOccupancyRate),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }, {
            label: 'Peak Occupancy Rate',
            data: floorStats.floorStats?.map(f => f.peakOccupancyRate),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        }}
        options={{
          responsive: true,
          animation: { duration: 750 },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Occupancy Rate (%)'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default FloorUsagePatternChart;
