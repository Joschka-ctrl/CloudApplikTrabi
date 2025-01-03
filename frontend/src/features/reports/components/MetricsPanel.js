import React from 'react';

const MetricsPanel = ({ metrics, revenueStats }) => {
  return (
    <div className="grid-item metrics-grid" id='pdf-metrics-grid'>
      <div className="metric">
        <h2>Key Metrics</h2>
        <p>Total Parked Vehicles: {metrics?.totalParkedVehicles || 0}</p>
        <p>Average Duration: {metrics?.averageDuration || 'N/A'}</p>
        {revenueStats && (
          <>
            <p>Total Revenue: €{revenueStats.totalRevenue?.toFixed(2) || '0.00'}</p>
            <p>Average Revenue per Vehicle: €{revenueStats.averageRevenuePerVehicle?.toFixed(2) || '0.00'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel;
