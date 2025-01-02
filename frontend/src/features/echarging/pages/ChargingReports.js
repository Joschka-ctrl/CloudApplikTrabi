import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { useAuth } from '../../../components/AuthProvider';
import ReportFilters from '../components/reports/ReportFilters';
import StatisticsCards from '../components/reports/StatisticsCards';
import UtilizationChart from '../components/reports/UtilizationChart';
import SessionsChart from '../components/reports/SessionsChart';
import ProviderRevenueCards from '../components/reports/ProviderRevenueCards';
import RevenueCharts from '../components/reports/RevenueCharts';

const ChargingReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedGarage, setSelectedGarage] = useState('');
  const [chargingStats, setChargingStats] = useState(null);
  const [utilizationData, setUtilizationData] = useState(null);
  const [providerRevenue, setProviderRevenue] = useState(null);
  const [loading, setLoading] = useState({
    stats: false,
    utilization: false,
    revenue: false
  });
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
      setLoading(prev => ({ ...prev, stats: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchUtilizationData = async () => {
    try {
      setLoading(prev => ({ ...prev, utilization: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, utilization: false }));
    }
  };

  const fetchProviderRevenue = async () => {
    try {
      setLoading(prev => ({ ...prev, revenue: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, revenue: false }));
    }
  };

  useEffect(() => {
    fetchChargingStats();
    fetchUtilizationData();
    fetchProviderRevenue();
  }, [startDate, endDate, selectedGarage]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        E-Charging Reports
      </Typography>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        selectedGarage={selectedGarage}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onGarageChange={setSelectedGarage}
      />

      <StatisticsCards stats={chargingStats} loading={loading.stats} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UtilizationChart utilizationData={utilizationData} loading={loading.utilization} />
        </Grid>
        <Grid item xs={12}>
          <SessionsChart utilizationData={utilizationData} loading={loading.utilization} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Card Provider Revenue
            </Typography>
            <ProviderRevenueCards providerRevenue={providerRevenue} loading={loading.revenue} />
          </Paper>
        </Grid>

        <RevenueCharts providerRevenue={providerRevenue} loading={loading.revenue} />
      </Grid>
    </Container>
  );
};

export default ChargingReports;
