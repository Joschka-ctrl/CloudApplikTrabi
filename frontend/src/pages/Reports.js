import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Reports.css';
import { useAuth } from '../components/AuthProvider';
import ChargingReports from '../features/echarging/pages/ChargingReports';
import { Tabs, Tab, Box } from '@mui/material';
import FilterPanel from '../features/reports/components/FilterPanel';
import MetricsPanel from '../features/reports/components/MetricsPanel';
import DailyUsageChart from '../features/reports/components/DailyUsageChart';
import FloorOccupancyChart from '../features/reports/components/FloorOccupancyChart';
import ParkingDurationChart from '../features/reports/components/ParkingDurationChart';
import DailyRevenueChart from '../features/reports/components/DailyRevenueChart';
import FloorUsagePatternChart from '../features/reports/components/FloorUsagePatternChart';
import ExportPDFButton from '../features/reports/components/ExportPDFButton';

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
  const [durationStats, setDurationStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [floorStats, setFloorStats] = useState(null);
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
    const fetchData = async () => {
      if (!selectedParkingPlace) return;
      
      // Validate date range
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        console.error('Start date cannot be after end date');
        return;
      }

      // Validate usage range
      if (minUsage && maxUsage && Number(minUsage) > Number(maxUsage)) {
        console.error('Min usage cannot be greater than max usage');
        return;
      }

      try {
        await Promise.all([
          fetchDailyUsage(),
          fetchFloorOccupancy(),
          fetchMetrics(),
          fetchDurationStats(),
          fetchRevenueStats(),
          fetchFloorStats()
        ]);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchData();
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
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (minUsage) params.append('minUsage', minUsage);
      if (maxUsage) params.append('maxUsage', maxUsage);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/daily-usage?${params}`);
      if (!response.ok) throw new Error('Failed to fetch daily usage data');
      
      const data = await response.json();
      
      const chartData = {
        labels: data.labels,
        datasets: [{
          label: 'Parking Usage',
          data: data.data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
      
      setDailyUsageData(chartData);
    } catch (error) {
      console.error('Error fetching daily usage:', error);
      setDailyUsageData(null);
    }
  };

  const fetchFloorOccupancy = async () => {
    try {
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/floor-stats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch floor occupancy data');
      
      const data = await response.json();
      setFloorStats(data);
      
      // Transform floor stats into pie chart data
      const floorData = data.floorStats || [];
      const chartData = {
        labels: floorData.map(floor => 
          `Floor ${floor.floor} (${floor.occupancyPercentage}% Occupied, ${floor.occupiedSpots}/${floor.totalSpots} spots)`
        ),
        datasets: [{
          data: floorData.map(floor => [
            floor.occupancyPercentage,
            100 - floor.occupancyPercentage
          ]).flat(),
          backgroundColor: floorData.map(() => ['#FF6384', '#e9ecef']).flat(),
          borderColor: floorData.map(() => ['#FF6384', '#e9ecef']).flat(),
          borderWidth: 1
        }]
      };
      
      setOccupancyData(chartData);
    } catch (error) {
      console.error('Error fetching floor occupancy:', error);
      setOccupancyData(null);
      setFloorStats(null);
    }
  };

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch metrics data');
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchDurationStats = async () => {
    try {
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/parking-duration?${params}`);
      if (!response.ok) throw new Error('Failed to fetch duration stats');
      
      const data = await response.json();
      setDurationStats(data);
    } catch (error) {
      console.error('Error fetching duration stats:', error);
      setDurationStats(null);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/parking-revenue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch revenue stats');
      
      const data = await response.json();
      setRevenueStats(data);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      setRevenueStats(null);
    }
  };

  const fetchFloorStats = async () => {
    try {
      const params = new URLSearchParams();
      params.append('parkingId', selectedParkingPlace);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetchWithAuth(`${HOST_URL}/api/reports/floor-stats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch floor stats');
      
      const data = await response.json();
      setFloorStats(data);
    } catch (error) {
      console.error('Error fetching floor stats:', error);
      setFloorStats(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FilterPanel 
            parkingPlaces={parkingPlaces}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
            minUsage={minUsage}
            maxUsage={maxUsage}
            onParkingPlaceChange={setSelectedParkingPlace}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onMinUsageChange={setMinUsage}
            onMaxUsageChange={setMaxUsage}
          />
          <ExportPDFButton
            metrics={metrics}
            dailyUsageData={dailyUsageData}
            durationStats={durationStats}
            revenueStats={revenueStats}
            floorStats={floorStats}
            selectedParkingPlace={selectedParkingPlace}
            dateRange={{ startDate, endDate }}
          />
        </Box>

        <div className="grid-container">
          <MetricsPanel metrics={metrics} revenueStats={revenueStats} />
          
          <DailyUsageChart 
            data={dailyUsageData}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
            minUsage={minUsage}
            maxUsage={maxUsage}
          />
          
          <FloorOccupancyChart 
            data={occupancyData}
            floorStats={floorStats}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
          />
          
          <ParkingDurationChart 
            durationStats={durationStats}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
          />
          
          <DailyRevenueChart 
            revenueStats={revenueStats}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
          />
          
          <FloorUsagePatternChart 
            floorStats={floorStats}
            selectedParkingPlace={selectedParkingPlace}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ChargingReports />
      </TabPanel>
    </div>
  );
};

export default Reports;
