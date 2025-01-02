import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Reports.css'; // Importing the CSS file for styling

const Reports = () => {
  // -----------------------------------------------
  // 1) Sample parking places
  // -----------------------------------------------
  const parkingPlaces = [
    { id: 'A', name: 'Parking A' },
    { id: 'B', name: 'Parking B' },
    { id: 'C', name: 'Parking C' },
  ];

  // -----------------------------------------------
  // 2) State for filters
  // -----------------------------------------------
  const [selectedParkingPlace, setSelectedParkingPlace] = useState(parkingPlaces[0].id);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minUsage, setMinUsage] = useState('');
  const [maxUsage, setMaxUsage] = useState('');

  // -----------------------------------------------
  // 3) Raw data (simulated)
  // -----------------------------------------------
  // Normally you would load this from an API,
  // and/or have different data per parking place.
  const rawDailyUsageData = {
    A: [30, 50, 70, 40, 90, 60, 80],
    B: [20, 40, 60, 30, 80, 50, 70],
    C: [10, 30, 40, 20, 60, 40, 50],
  };

  // Occupancy by floors, each key is a parking place
  const rawOccupancyData = {
    A: [60, 80, 50, 40], // Floors 1,2,3,4
    B: [40, 70, 45, 30],
    C: [50, 60, 40, 20],
  };

  // -----------------------------------------------
  // 4) Helper function to apply date and usage filters
  //    In reality, you might filter by timestamps or
  //    fetch new data from the server with these filters
  // -----------------------------------------------
  const applyFiltersToData = (dataset) => {
    // For demonstration, we only show how you *could* filter.
    // We'll do a trivial usage filter here.

    let filteredData = dataset;

    if (minUsage) {
      filteredData = filteredData.map((val) => (val >= minUsage ? val : 0));
    }

    if (maxUsage) {
      filteredData = filteredData.map((val) => (val <= maxUsage ? val : 0));
    }

    // Date range filtering is not explicitly shown here since
    // these arrays don't have date labels. In a real app,
    // you would filter out data points whose date is outside
    // [startDate, endDate].

    return filteredData;
  };

  // -----------------------------------------------
  // 5) Build the chart data using currently selected parking
  //    place and filters
  // -----------------------------------------------
  const parkingData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Parking Usage',
        data: applyFiltersToData(rawDailyUsageData[selectedParkingPlace]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Occupancy (e.g., floors 1,2,3,4)
  const floors = ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
  const occupancyData = {
    labels: floors,
    datasets: [
      {
        label: 'Occupancy',
        data: applyFiltersToData(rawOccupancyData[selectedParkingPlace]),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // -----------------------------------------------
  // 6) Metrics could also vary by parking place.
  //    For demonstration, let's calculate total parked vehicles
  //    as the sum of the daily usage array (unfiltered).
  // -----------------------------------------------
  const totalParkedVehicles = rawDailyUsageData[selectedParkingPlace].reduce((sum, val) => sum + val, 0);
  const averageDuration = '2 hours 30 minutes'; // Placeholder

  // -----------------------------------------------
  // 7) UI for filters and charts
  // -----------------------------------------------
  return (
    <div className="reports-container">
      <h1>Parking Management Reports</h1>

      {/* ---- Filter Controls ---- */}
      <div className="filters-container">
        <div className="filter-item">
          <label htmlFor="parkingPlaceSelect">Parking Place:</label>
          <select
            id="parkingPlaceSelect"
            value={selectedParkingPlace}
            onChange={(e) => setSelectedParkingPlace(e.target.value)}
          >
            {parkingPlaces.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="minUsage">Min Usage:</label>
          <input
            type="number"
            id="minUsage"
            value={minUsage}
            onChange={(e) => setMinUsage(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="maxUsage">Max Usage:</label>
          <input
            type="number"
            id="maxUsage"
            value={maxUsage}
            onChange={(e) => setMaxUsage(e.target.value)}
            placeholder="e.g. 80"
          />
        </div>
      </div>

      {/* ---- Charts and Metrics ---- */}
      <div className="grid-container">
        <div className="grid-item metrics-grid">
          <div className="metric">
            <h2>Key Metrics</h2>
            <p>Total Parked Vehicles: {totalParkedVehicles}</p>
            <p>Average Duration: {averageDuration}</p>
          </div>
        </div>

        <div className="grid-item chart">
          <h2>Daily Parking Usage</h2>
          <Bar data={parkingData} />
        </div>

        <div className="grid-item chart">
          <h2>Occupancy by Floor</h2>
          <Pie data={occupancyData} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
