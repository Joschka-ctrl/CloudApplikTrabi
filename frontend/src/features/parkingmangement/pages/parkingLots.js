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
import ParkingLotTable from '../components/parkingLotTable';
import { useAuth } from '../../../components/AuthProvider';

const ParkingLots = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [facilities, setFacilities] = useState([]);
  const { user } = useAuth();

  const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/parking';

  const fetchParkingLots = async () => {
    try {
      const token = await user.getIdToken();
      const url = selectedFacility 
        ? `${HOST_URL}/parking-lots?facility=${encodeURIComponent(selectedFacility)}`
        : `${HOST_URL}/parking-lots`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setParkingLots(data);
      
      // Extract unique facilities
      const uniqueFacilities = [...new Set(data.map(lot => lot.facilityId))].filter(Boolean);
      setFacilities(uniqueFacilities);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, [selectedFacility]);

  const handleFacilityChange = (event) => {
    setSelectedFacility(event.target.value);
  };

  const handleAddLot = () => {
    setSelectedLot(null);
    setIsFormOpen(true);
  };

  const handleEditLot = (lot) => {
    setSelectedLot(lot);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLot(null);
  };

  const handleSave = async (lotData) => {
    try {
      const token = await user.getIdToken();
      const url = selectedLot
        ? `${HOST_URL}/parking-lots/${selectedLot.id}`
        : `${HOST_URL}/parking-lots`;
      
      const method = selectedLot ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lotData)
      });

      fetchParkingLots();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving parking lot:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parking Lots
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="facility-select-label">Facility</InputLabel>
          <Select
            labelId="facility-select-label"
            id="facility-select"
            value={selectedFacility}
            label="Facility"
            onChange={handleFacilityChange}
          >
            <MenuItem value="">All</MenuItem>
            {facilities.map(facility => (
              <MenuItem key={facility} value={facility}>{facility}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddLot}
        >
          Add Parking Lot
        </Button>
        </Box>

        <ParkingLotTable
          parkingLots={parkingLots}
          onEdit={handleEditLot}
          onRefresh={fetchParkingLots}
        />

       
      </Box>
    </Container>
  );
};

export default ParkingLots;
