import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChargingStationTable from '../components/ChargingStationTable';
import ChargingStationForm from '../components/ChargingStationForm';
import { useAuth } from '../../../components/AuthProvider';

const ChargingStations = () => {
  const [stations, setStations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedGarage, setSelectedGarage] = useState('');
  const [garages, setGarages] = useState([]);
  const { user, currentTenantId } = useAuth();

  const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3016' : '/api/echarging';

  const fetchStations = async () => {
    try {
      console.log(user);
      const token = await user.accessToken;
      const url = selectedGarage 
        ? `${HOST_URL}/charging-stations?garage=${encodeURIComponent(selectedGarage)}&tenantId=${encodeURIComponent(currentTenantId)}`
        : `${HOST_URL}/charging-stations?tenantId=${encodeURIComponent(currentTenantId)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStations(data);
      
      // Extract unique garages
      const uniqueGarages = [...new Set(data.map(station => station.garage))].filter(Boolean);
      setGarages(uniqueGarages);
    } catch (error) {
      console.error('Error fetching charging stations:', error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [selectedGarage]);

  const handleGarageChange = (event) => {
    setSelectedGarage(event.target.value);
  };

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
      const token = await user.getIdToken();
      
      const url = selectedStation
        ? `${HOST_URL}/charging-stations/${selectedStation.id}`
        : `${HOST_URL}/charging-stations`;
      
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
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Charging Stations
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="garage-select-label">Garage</InputLabel>
          <Select
            labelId="garage-select-label"
            id="garage-select"
            value={selectedGarage}
            label="Garage"
            onChange={handleGarageChange}
          >
            <MenuItem value="">All</MenuItem>
            {garages.map(garage => (
              <MenuItem key={garage} value={garage}>{garage}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStation}
        >
          Add Charging Station
        </Button>
        </Box>

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
