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
  Typography,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../../components/AuthProvider';




const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/parking';

const ParkingLots = () => {
  const { user, currentTenantId } = useAuth();
  const tenantId = currentTenantId;
  const token = user.accessToken;
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [parkingSpots, setParkingSpots] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [floorStats, setFloorStats] = useState([]);


  useEffect(() => {
    // tenantId = tenantId || '15';

    fetch(`${HOST_URL}/facilities/${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch facilities: ${response.status}`))
      .then(data => setFacilities(data))
      .catch(error => console.error(error));
  }, [tenantId]);

  useEffect(() => {
    // tenantId = tenantId || '15';
    if (selectedFacilityId) {
      fetch(`${HOST_URL}/parkingSpots/${tenantId}/${selectedFacilityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch parking spots: ${response.status}`))
        .then(data => setParkingSpots(data))
        .catch(error => console.error(error));

      

      fetch(`${HOST_URL}/parkingStats/floors/${tenantId}/${selectedFacilityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch floor stats: ${response.status}`))
        .then(data => setFloorStats(data.floorStats || []))
        .catch(error => console.error(error));

    } else {
      setParkingSpots([]);
      setFloorStats([]);
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
    return fetch(`${HOST_URL}/handleSpotAvalibilityStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
          <Button
            variant="contained"
            style={{
              backgroundColor: statusColor,
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '50px', // Oval shape
              padding: '5px 15px', // Padding to make it oval
              cursor: 'pointer',
              minWidth: '120px', // Ensure all buttons are at least 120px wide
              height: '40px', // Fixed height for buttons
              textAlign: 'center', // Center text
            }}
            onClick={() => handleOpenPopup(params.row.id)} // Handle click
          >
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)} {/* Display full status text */}
          </Button>
        );
      },
    },
  ];


  return (
    <Container style={{ marginTop: '60px' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Parking Management
      </Typography>
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

      {/* /* Stats Section */}
      {floorStats.length > 0 && (
        <Paper
          sx={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#f7f9fc',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: 'auto', // Flexible height
            width: '100%',
            overflow: 'hidden', // Verhindert das Überlaufen des Inhalts
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#2c3e50',
              textAlign: 'center',
              marginBottom: '10px', // Kleinere Margen
              fontSize: '18px', // Kleinere Schriftgröße
            }}
          >
            Floor Statistics
          </Typography>
          <Grid container spacing={1}>
            {floorStats.map((floor) => (
              <Grid item xs={12} sm={6} md={4} key={floor.floor}>
                <Paper
                  sx={{
                    padding: '10px',
                    textAlign: 'center',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#ffffff',
                    height: '100%', // Volle Höhe innerhalb des Grid
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between', // Verteilt den Inhalt innerhalb der Kachel
                  }}
                >
                  <Typography
                    variant="body1"
                    component="h3"
                    sx={{ fontWeight: 'bold', color: '#34495e', fontSize: '16px' }} // Kleinere Schriftgröße
                  >
                    Floor {floor.floor}
                  </Typography>
                  <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
                    Total Spots: <strong>{floor.totalSpots}</strong>
                  </Typography>
                  <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
                    Closed Spots: <strong>{floor.closedSpots}</strong>
                  </Typography>
                  <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
                    Occupied Spots: <strong>{floor.occupiedSpots}</strong>
                  </Typography>
                  <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
                    Available Spots: <strong>{floor.availibleSpots}</strong>
                  </Typography>
                  <Typography
                    sx={{
                      color: floor.occupancyPercentage > 75 ? '#e74c3c' : '#2ecc71',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    Occupancy: {floor.occupancyPercentage}%
                  </Typography>
                  {/* Optional: Durchschnittliche Belegungszeit */}
                  {/* <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
              Avg. Occupancy Time: <strong>{Math.round(floor.averageOccupancyTime)} sec</strong>
            </Typography> */}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}


      {parkingSpots.length > 0 && (
        <Paper sx={{ height: 800, width: '100%' }}>
          <DataGrid
            rows={parkingSpots}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            // checkboxSelection
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
