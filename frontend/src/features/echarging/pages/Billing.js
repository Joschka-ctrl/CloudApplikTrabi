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
