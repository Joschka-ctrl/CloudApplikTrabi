import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useAuth } from '../../../components/AuthProvider';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
} from '@mui/material';

const ChargingReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedGarage, setSelectedGarage] = useState('');
  const [chargingStats, setChargingStats] = useState(null);
  const [utilizationData, setUtilizationData] = useState(null);
  const [providerRevenue, setProviderRevenue] = useState(null);
  const { user } = useAuth();

  const fetchWithAuth = async (url, options = {}) => {
    if (user) {
      const token = await user.getIdToken();
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    } else {
      throw new Error("User is not authenticated");
    }
  };

  const fetchChargingStats = async () => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedGarage && { garage: selectedGarage })
      });

      const response = await fetchWithAuth(
        `http://localhost:3004/api/reports/echarging/stats?${params}`
      );
      const data = await response.json();
      setChargingStats(data);
    } catch (error) {
      console.error('Error fetching charging stats:', error);
    }
  };

  const fetchUtilizationData = async () => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedGarage && { garage: selectedGarage })
      });

      const response = await fetchWithAuth(
        `http://localhost:3004/api/reports/echarging/utilization?${params}`
      );
      const data = await response.json();
      setUtilizationData(data);
    } catch (error) {
      console.error('Error fetching utilization data:', error);
    }
  };

  const fetchProviderRevenue = async () => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedGarage && { garage: selectedGarage })
      });

      const response = await fetchWithAuth(
        `http://localhost:3004/api/reports/echarging/card-provider-revenue?${params}`
      );
      const data = await response.json();
      setProviderRevenue(data);
    } catch (error) {
      console.error('Error fetching provider revenue:', error);
    }
  };

  useEffect(() => {
    fetchChargingStats();
    fetchUtilizationData();
    fetchProviderRevenue();
  }, [startDate, endDate, selectedGarage]);

  const utilizationChartData = {
    labels: utilizationData?.map(station => station.location) || [],
    datasets: [
      {
        label: 'Station Utilization (%)',
        data: utilizationData?.map(station => station.utilization) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const sessionStatsChartData = utilizationData ? {
    labels: utilizationData.map(station => station.location),
    datasets: [
      {
        label: 'Total Sessions',
        data: utilizationData.map(station => station.totalSessions),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        E-Charging Reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Garage"
              value={selectedGarage}
              onChange={(e) => setSelectedGarage(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      {chargingStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h5">
                  {chargingStats.totalSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Energy (kWh)
                </Typography>
                <Typography variant="h5">
                  {chargingStats.totalEnergy.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg. Session Duration (h)
                </Typography>
                <Typography variant="h5">
                  {chargingStats.averageSessionDuration.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg. Energy per Session (kWh)
                </Typography>
                <Typography variant="h5">
                  {chargingStats.averageEnergyPerSession.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Station Utilization
            </Typography>
            {utilizationData && (
              <Box sx={{ height: 400 }}>
                <Bar
                  data={utilizationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Utilization (%)'
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Sessions by Station
            </Typography>
            {sessionStatsChartData && (
              <Box sx={{ height: 400 }}>
                <Bar
                  data={sessionStatsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Sessions'
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Provider Revenue Section */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Card Provider Revenue
            </Typography>
            {providerRevenue && (
              <Grid container spacing={3}>
                {Object.entries(providerRevenue).map(([provider, stats]) => (
                  <Grid item xs={12} sm={6} md={4} key={provider}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {provider}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Revenue
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          €{stats.totalRevenue.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Sessions
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {stats.totalSessions}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Energy (kWh)
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {stats.totalEnergy.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Rate per kWh
                        </Typography>
                        <Typography variant="h6">
                          €{stats.ratePerKwh.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Average Revenue/Session
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          €{stats.averageRevenuePerSession.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Provider Revenue Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Comparison
            </Typography>
            {providerRevenue && (
              <Box sx={{ height: 400 }}>
                <Bar
                  data={{
                    labels: Object.keys(providerRevenue),
                    datasets: [
                      {
                        label: 'Total Revenue (€)',
                        data: Object.values(providerRevenue).map(stats => stats.totalRevenue),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Average Revenue per Session (€)',
                        data: Object.values(providerRevenue).map(stats => stats.averageRevenuePerSession),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChargingReports;
