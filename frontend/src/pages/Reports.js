import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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

          <div className="grid-item chart">
            <h2>Daily Parking Usage</h2>
            {dailyUsageData && (
              <Bar 
                key={`daily-${selectedParkingPlace}-${startDate}-${endDate}-${minUsage}-${maxUsage}`}
                data={dailyUsageData}
                options={{
                  responsive: true,
                  animation: { duration: 750 },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            )}
          </div>

          <div className="grid-item chart">
            <h2>Occupancy by Floor</h2>
            {occupancyData && floorStats && (
              <Pie 
                key={`occupancy-${selectedParkingPlace}-${startDate}-${endDate}`}
                data={occupancyData}
                options={{
                  responsive: true,
                  animation: { duration: 750 },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        generateLabels: (chart) => {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            return data.labels.filter((_, i) => i % 2 === 0).map((label, i) => ({
                              text: label,
                              fillStyle: data.datasets[0].backgroundColor[i * 2],
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
            )}
          </div>

          {durationStats && (
            <div className="grid-item chart">
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
          )}

          {revenueStats && (
            <div className="grid-item chart">
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
          )}

          {floorStats && (
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
          )}
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ChargingReports />
      </TabPanel>
    </div>
  );
};

export default Reports;
