import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import ChargingStations from './ChargingStations';
import ChargingSessions from './ChargingSessions';

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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Charging Stations" />
            <Tab label="Charging Sessions" />
          </Tabs>
        </Box>

        {selectedTab === 0 && <ChargingStations />}
        {selectedTab === 1 && <ChargingSessions />}
      </Box>
    </Container>
  );
};

export default ECharging;
