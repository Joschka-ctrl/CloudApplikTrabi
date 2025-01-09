import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import ChargingStations from './ChargingStations';
import ChargingSessions from './ChargingSessions';
import Billing from './Billing';

const ECharging = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-Charging Management
        </Typography>

        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 48 }}
          >
            <Tab label="Charging Stations" />
            <Tab label="Charging Sessions" />
            <Tab label="Billing Management" />
          </Tabs>
        </Box>

        {selectedTab === 0 && <ChargingStations />}
        {selectedTab === 1 && <ChargingSessions />}
        {selectedTab === 2 && <Billing />}
      </Box>
    </Container>
  );
};

export default ECharging;
