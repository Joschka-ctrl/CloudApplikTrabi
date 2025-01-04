import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Container,
  Paper,
  Modal,
  Box,
  Button,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/echarging';

const ParkingLots = ({ tenantId }) => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [parkingSpots, setParkingSpots] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    tenantId = tenantId || '15';
    fetch(`${HOST_URL}/facilities/${tenantId}`)
      .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch facilities: ${response.status}`))
      .then(data => setFacilities(data))
      .catch(error => console.error(error));
  }, [tenantId]);

  useEffect(() => {
    tenantId = tenantId || '15';
    if (selectedFacilityId) {
      fetch(`${HOST_URL}/parkingSpots/${tenantId}/${selectedFacilityId}`)
        .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch parking spots: ${response.status}`))
        .then(data => setParkingSpots(data))
        .catch(error => console.error(error));
    } else {
      setParkingSpots([]);
    }
  }, [selectedFacilityId, tenantId]);

  const handleFacilityChange = (event) => {
    setSelectedFacilityId(event.target.value);
  };

  const handleOpenPopup = (spotId) => {
    setSelectedSpotId(spotId);
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setSelectedSpotId(null);
  };
  const handleChangeOccupiedStatus = (tenantId, action) => {
    const occupiedStatus = action === 'reserve'; // Wenn 'reserve', dann auf belegt setzen, sonst auf frei
    console.log("occupied", occupiedStatus);
    fetch(`${HOST_URL}/reverseOccupancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSpotId, tenantID: tenantId, facilityID: selectedFacilityId, occupied: occupiedStatus })
    })
    .then(response => {
        console.log(response);
        if (!response.ok) throw new Error(`Failed to ${action === 'reserve' ? 'update' : 'release'} parking spot status: ${response.status}`);
        return response.json();
    })
    .then(() => {
        const updatedSpots = parkingSpots.map(spot => spot.id === selectedSpotId ? { ...spot, occupied: action === 'reserve' } : spot);
        setParkingSpots(updatedSpots);
        handleClosePopup();
    })
    .catch(error => console.error(error));
};


  const columns = [
   
    { field: 'id', headerName: 'Parking Spot Number',flex: 1, sortable: true },
    { field: 'isOnfloor', headerName: 'Floor', flex: 1, sortable: true },
    {
      field: 'occupied',
      headerName: 'Occupied',
      flex: 1,
      renderCell: (params) => (
        <div style={{
          color: params.value ? 'green' : 'red',
          fontWeight: 'bold',
          cursor: 'pointer'
        }} onClick={() => handleOpenPopup(params.row.id)}>
          {params.value.toString()}
        </div>
      )
    }
  ];

  return (
    <Container style={{ marginTop: '50px' }}>
      <FormControl fullWidth margin="normal">
        <Select
          labelId="facility-id-label"
          value={selectedFacilityId}
          onChange={handleFacilityChange}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select a Facility ID
          </MenuItem>
          {facilities.length > 0 ? (
            facilities.map(facility => (
              <MenuItem key={facility.facilityId} value={facility.facilityId}>
                {facility.facilityId}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No facilities available</MenuItem>
          )}
        </Select>
      </FormControl>

      {parkingSpots.length > 0 && (
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={parkingSpots}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </Paper>
      )}

      <Modal
        open={openPopup}
        onClose={handleClosePopup}
        aria-labelledby="change-status-modal"
        aria-describedby="change-occupied-status"
      >
        <Box sx={{ ...style, width: 300 }}>
          <Typography variant="h6" component="h2" align="center">
            Change Parking Spot Status
          </Typography>
          <Typography variant="body1" align="center">
            Do you want to change the status of this parking spot?
          </Typography>
          <Button variant="contained" color="primary" onClick={() => handleChangeOccupiedStatus("15", 'reserve')} sx={{ mt: 2 }}>
            Mark as Occupied
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleChangeOccupiedStatus("15", 'release')} sx={{ mt: 2 }}>
            Release Spot
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClosePopup} sx={{ mt: 2 }}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default ParkingLots;
