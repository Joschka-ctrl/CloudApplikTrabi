import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Reports.css';
import { useAuth } from '../components/AuthProvider';
import ChargingReports from '../features/echarging/pages/ChargingReports';
import { Tabs, Tab, Box } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports = () => {
  const [parkingPlaces, setParkingPlaces] = useState([]);
  const [selectedParkingPlace, setSelectedParkingPlace] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minUsage, setMinUsage] = useState('');
  const [maxUsage, setMaxUsage] = useState('');
  const [dailyUsageData, setDailyUsageData] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [metrics, setMetrics] = useState({ totalParkedVehicles: 0, averageDuration: 'N/A' });
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  const HOST_URL = 'http://localhost:3004';

  const fetchWithAuth = async (url, options = {}) => {
    if (user) {
      const token = await user.getIdToken(); // Fetch the token from the user object
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    } else {
      throw new Error("User is not authenticated");
    }
  };

  // Fetch parking places on component mount
  useEffect(() => {
    fetchParkingPlaces();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedParkingPlace) {
      fetchDailyUsage();
      fetchFloorOccupancy();
      fetchMetrics();
    }
  }, [selectedParkingPlace, startDate, endDate, minUsage, maxUsage]);

  const fetchParkingPlaces = async () => {
    try {
      const response = await fetchWithAuth(`${HOST_URL}/api/reports/parking-places`);
      const data = await response.json();
      setParkingPlaces(data);
      if (data.length > 0) {
        setSelectedParkingPlace(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching parking places:', error);
    }
  };

  const fetchDailyUsage = async () => {
    try {
      const params = new URLSearchParams({
        parkingId: selectedParkingPlace,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(minUsage && { minUsage }),
        ...(maxUsage && { maxUsage })
      });

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/daily-usage?${params}`);
      const data = await response.json();
      
      setDailyUsageData({
        labels: data.labels,
        datasets: [{
          label: 'Parking Usage',
          data: data.data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
      });
    } catch (error) {
      console.error('Error fetching daily usage:', error);
    }
  };

  const fetchFloorOccupancy = async () => {
    try {
      const params = new URLSearchParams({
        parkingId: selectedParkingPlace
      });

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/floor-occupancy?${params}`);
      const data = await response.json();
      
      setOccupancyData({
        labels: data.labels,
        datasets: [{
          label: 'Occupancy',
          data: data.data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        }],
      });
    } catch (error) {
      console.error('Error fetching floor occupancy:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams({
        parkingId: selectedParkingPlace,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/metrics?${params}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="reports-container">
      <h1>Parking Management Reports</h1>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} 
          onChange={handleTabChange} 
          aria-label="report tabs"
          variant="scrollable"
          scrollButtons="auto">
          <Tab label="Parking Reports" />
          <Tab label="E-Charging Reports" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className="filters-container">
          <div className="filter-item">
            <label htmlFor="parkingPlaceSelect">Parking Place:</label>
            <select
              id="parkingPlaceSelect"
              value={selectedParkingPlace}
              onChange={(e) => setSelectedParkingPlace(e.target.value)}
            >
              <option value="">Select Parking Place</option>
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

        <div className="grid-container">
          <div className="grid-item metrics-grid">
            <div className="metric">
              <h2>Key Metrics</h2>
              <p>Total Parked Vehicles: {metrics.totalParkedVehicles}</p>
              <p>Average Duration: {metrics.averageDuration}</p>
            </div>
          </div>

          <div className="grid-item chart">
            <h2>Daily Parking Usage</h2>
            {dailyUsageData && <Bar data={dailyUsageData} />}
          </div>

          <div className="grid-item chart">
            <h2>Occupancy by Floor</h2>
            {occupancyData && <Pie data={occupancyData} />}
          </div>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ChargingReports />
      </TabPanel>
    </div>
  );
};

export default Reports;
