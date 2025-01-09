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

const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/parking';

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

  const handleChangeSpotAvailabilityStatus = (newStatus) => {
    tenantId = tenantId || '15';
    return fetch(`${HOST_URL}/handleSpotAvalibilityStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedSpotId,
        tenantID: tenantId,
        facilityID: selectedFacilityId,
        newStatus: newStatus,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to update parking spot status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        const updatedSpots = parkingSpots.map((spot) =>
          spot.id === selectedSpotId
            ? {
                ...spot,
                avalibilityStatus: newStatus, // Set the status
              }
            : spot
        );
        setParkingSpots(updatedSpots);
        handleClosePopup();
      })
      .catch((error) => console.error(error));
  };
  


  const columns = [
    { field: 'id', headerName: 'Parking Spot Number', flex: 1, sortable: true },
    { field: 'isOnfloor', headerName: 'Floor', flex: 1, sortable: true },
    {
      field: 'avalibilityStatus',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        let statusColor;
        switch (params.value) {
          case 'occupied':
            statusColor = '#FFCC00'; // Yellow for occupied
            break;
          case 'free':
            statusColor = '#4CAF50'; // Green for free
            break;
          case 'closed':
            statusColor = '#F44336'; // Red for closed
            break;
          default:
            statusColor = '#9E9E9E'; // Gray for unknown
            break;
        }
  
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: statusColor,
              borderRadius: '50px', // Oval shape
              padding: '5px 15px', // Padding to make it oval
              color: 'white', // Keep text color white
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => handleOpenPopup(params.row.id)}
          >
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)} {/* Display full status text */}
          </div>
        );
      },
    },
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
        aria-describedby="change-spot-status"
      >
        <Box sx={{ ...style, width: 300 }}>
          <Typography variant="h6" component="h2" align="center">
            Change Parking Spot Status
          </Typography>
          <Typography variant="body1" align="center">
            Select the new status for this parking spot.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleChangeSpotAvailabilityStatus("occupied")}
            sx={{ mt: 2 }}
          >
            Mark as Occupied
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleChangeSpotAvailabilityStatus("free")}
            sx={{ mt: 2 }}
          >
            Release Spot
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleChangeSpotAvailabilityStatus("closed")}
            sx={{ mt: 2 }}
          >
            Close Spot
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClosePopup}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>;
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
