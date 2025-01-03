import React from 'react';
import { Bar } from 'react-chartjs-2';

const ParkingDurationChart = ({ durationStats, selectedParkingPlace, startDate, endDate }) => {
  if (!durationStats) return null;

  return (
    <div className="grid-item chart" id='pdf-parking-duration-chart'>
      <h2>Parking Duration Distribution</h2>
      <Bar
        key={`duration-${selectedParkingPlace}-${startDate}-${endDate}`}
        data={{
          labels: durationStats.labels,
          datasets: [{
            label: 'Number of Vehicles',
            data: durationStats.data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        }}
        options={{
          responsive: true,
          animation: { duration: 750 },
          scales: {
            y: { 
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Vehicles'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Duration (hours)'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default ParkingDurationChart;
