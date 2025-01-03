import React from 'react';
import { Bar } from 'react-chartjs-2';

const DailyUsageChart = ({ data, selectedParkingPlace, startDate, endDate, minUsage, maxUsage }) => {
  if (!data) return null;

  return (
    <div className="grid-item chart">
      <h2>Daily Parking Usage</h2>
      <Bar 
        key={`daily-${selectedParkingPlace}-${startDate}-${endDate}-${minUsage}-${maxUsage}`}
        data={data}
        options={{
          responsive: true,
          animation: { duration: 750 },
          scales: {
            y: { beginAtZero: true }
          }
        }}
      />
    </div>
  );
};

export default DailyUsageChart;
