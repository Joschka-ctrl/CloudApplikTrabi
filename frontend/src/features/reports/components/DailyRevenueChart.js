import React from 'react';
import { Line } from 'react-chartjs-2';

const DailyRevenueChart = ({ revenueStats, selectedParkingPlace, startDate, endDate }) => {
  if (!revenueStats) return null;

  return (
    <div className="grid-item chart" id='pdf-revenue-chart'>
      <h2>Daily Revenue</h2>
      <Line
        key={`revenue-${selectedParkingPlace}-${startDate}-${endDate}`}
        data={{
          labels: revenueStats.dailyRevenue?.map(d => d.date) || [],
          datasets: [{
            label: 'Revenue (€)',
            data: revenueStats.dailyRevenue?.map(d => d.amount) || [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
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
                text: 'Revenue (€)'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default DailyRevenueChart;
