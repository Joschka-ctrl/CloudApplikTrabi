import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { useAuth } from '../../../components/AuthProvider';
import TotalStatistics from '../components/billing/TotalStatistics';
import ProviderRatesForm from '../components/billing/ProviderRatesForm';
import CurrentRatesTable from '../components/billing/CurrentRatesTable';
import BillingSummaryGrid from '../components/billing/BillingSummaryGrid';

const Billing = () => {
  const [providerRates, setProviderRates] = useState([]);
  const [billingSummary, setBillingSummary] = useState({});
  const [newRate, setNewRate] = useState({ provider: '', ratePerKw: '' });
  const [totalStats, setTotalStats] = useState({ energy: 0, revenue: 0, sessions: 0 });
  const { user } = useAuth();

  const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3016' : '/api/echarging';

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

  const fetchProviderRates = async () => {
    try {
      const response = await fetchWithAuth(`${HOST_URL}/provider-rates?tenantId=${encodeURIComponent(user.tenantId)}`);
      const data = await response.json();
      setProviderRates(data);
    } catch (error) {
      console.error('Error fetching provider rates:', error);
    }
  };

  const fetchBillingSummary = async () => {
    try {
      const response = await fetchWithAuth(`${HOST_URL}/billing-summary?tenantId=${encodeURIComponent(user.tenantId)}`);
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
      await fetchWithAuth(`${HOST_URL}/provider-rates?tenantId=${encodeURIComponent(user.tenantId)}`, {
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
      <TotalStatistics totalStats={totalStats} />
      <ProviderRatesForm
        newRate={newRate}
        setNewRate={setNewRate}
        onSubmit={handleSubmitRate}
      />
      <CurrentRatesTable providerRates={providerRates} />
      <BillingSummaryGrid billingSummary={billingSummary} />
    </Container>
  );
};

export default Billing;
