import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChargingStationTable from '../components/ChargingStationTable';
import ChargingStationForm from '../components/ChargingStationForm';
import { useAuth } from '../components/AuthProvider';

const ChargingStations = () => {
  const [stations, setStations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const { getIdToken } = useAuth();

  const fetchStations = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch('http://localhost:3016/charging-stations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching charging stations:', error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleAddStation = () => {
    setSelectedStation(null);
    setIsFormOpen(true);
  };

  const handleEditStation = (station) => {
    setSelectedStation(station);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStation(null);
  };

  const handleSave = async (stationData) => {
    try {
      const token = await getIdToken();
      const url = selectedStation
        ? `http://localhost:3016/charging-stations/${selectedStation.id}`
        : 'http://localhost:3016/charging-stations';
      
      const method = selectedStation ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stationData)
      });

      fetchStations();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving charging station:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Charging Stations
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStation}
          sx={{ mb: 3 }}
        >
          Add Charging Station
        </Button>

        <ChargingStationTable
          stations={stations}
          onEdit={handleEditStation}
          onRefresh={fetchStations}
        />

        <ChargingStationForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
          station={selectedStation}
        />
      </Box>
    </Container>
  );
};

export default ChargingStations;
