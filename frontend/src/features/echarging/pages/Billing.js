import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../../../components/AuthProvider';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import EuroIcon from '@mui/icons-material/Euro';

const Billing = () => {
  const [providerRates, setProviderRates] = useState([]);
  const [billingSummary, setBillingSummary] = useState({});
  const [newRate, setNewRate] = useState({ provider: '', ratePerKw: '' });
  const [totalStats, setTotalStats] = useState({ energy: 0, revenue: 0, sessions: 0 });
  const { user } = useAuth();

  const fetchProviderRates = async () => {
    try {
      const response = await fetch('http://localhost:3016/provider-rates');
      const data = await response.json();
      setProviderRates(data);
    } catch (error) {
      console.error('Error fetching provider rates:', error);
    }
  };

  const fetchBillingSummary = async () => {
    try {
      const response = await fetch('http://localhost:3016/billing-summary');
      const data = await response.json();
      setBillingSummary(data);
      
      // Calculate totals
      const totals = Object.values(data).reduce((acc, curr) => ({
        energy: acc.energy + curr.totalEnergy,
        revenue: acc.revenue + curr.totalAmount,
        sessions: acc.sessions + curr.sessions
      }), { energy: 0, revenue: 0, sessions: 0 });
      
      setTotalStats(totals);
    } catch (error) {
      console.error('Error fetching billing summary:', error);
    }
  };

  useEffect(() => {
    fetchProviderRates();
    fetchBillingSummary();
  }, []);

  const handleSubmitRate = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3016/provider-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRate)
      });
      setNewRate({ provider: '', ratePerKw: '' });
      fetchProviderRates();
      fetchBillingSummary();
    } catch (error) {
      console.error('Error updating provider rate:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Total Statistics Card */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
              Total Statistics
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ElectricBoltIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Energy</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {totalStats.energy.toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across {totalStats.sessions} sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EuroIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {totalStats.revenue.toFixed(2)} €
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average: {(totalStats.revenue / totalStats.sessions || 0).toFixed(2)} € per session
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ElectricBoltIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Average Consumption</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {(totalStats.energy / totalStats.sessions || 0).toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Per charging session
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Provider Rates Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add/Update Provider Rate
        </Typography>
        <Box component="form" onSubmit={handleSubmitRate} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Provider Name"
                value={newRate.provider}
                onChange={(e) => setNewRate({ ...newRate, provider: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Rate per kW (€)"
                type="number"
                step="0.01"
                value={newRate.ratePerKw}
                onChange={(e) => setNewRate({ ...newRate, ratePerKw: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ height: '56px' }}
              >
                Save Rate
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Current Rates Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Provider Rates
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Rate per kW (€)</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providerRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.provider}</TableCell>
                  <TableCell>{rate.ratePerKw.toFixed(2)} €</TableCell>
                  <TableCell>
                    {rate.updatedAt ? new Date(rate.updatedAt._seconds * 1000).toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Billing Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Billing Summary
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(billingSummary).map(([provider, data]) => (
            <Grid item xs={12} sm={6} md={4} key={provider}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {provider}
                  </Typography>
                  <Typography variant="body1">
                    Total Sessions: {data.sessions}
                  </Typography>
                  <Typography variant="body1">
                    Total Energy: {data.totalEnergy.toFixed(2)} kWh
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
                    Revenue: {data.totalAmount.toFixed(2)} €
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Billing;
