import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Container,
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/echarging';

const ParkingLots = ({ tenantId }) => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [parkingSpots, setParkingSpots] = useState([]);

  useEffect(() => {
    // Set default tenantId if not provided
    tenantId = tenantId || '15';

    // Fetch facilities for the given tenantId
    fetch(`${HOST_URL}/facilities/${tenantId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch facilities. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setFacilities(data);
      })
      .catch(error => console.error('Error fetching facilities:', error));
  }, [tenantId]);

  useEffect(() => {
    tenantId = tenantId || '15';

    if (selectedFacilityId) {
      // Fetch parking spots based on the selectedFacilityId
      fetch(`${HOST_URL}/parkingSpots/${tenantId}/${selectedFacilityId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch parking spots. Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setParkingSpots(data); // Updates only the parkingSpots state
        })
        .catch(error => console.error('Error fetching parking spots:', error));
    } else {
      setParkingSpots([]); // Clear parking spots if no facility selected
    }
  }, [selectedFacilityId, tenantId]);

  const handleFacilityChange = (event) => {
    setSelectedFacilityId(event.target.value);
  };

  // Sort function
  const sortParkingSpots = (key) => {
    const sortedSpots = [...parkingSpots].sort((a, b) => {
      if (key === 'floor') {
        return a.isOnfloor - b.isOnfloor; // Sort by floor (numerical order)
      } else if (key === 'occupied') {
        return (a.occupied === b.occupied) ? 0 : a.occupied ? -1 : 1; // Sort by occupied (true > false)
      }
      return 0;
    });
    setParkingSpots(sortedSpots);
  };

  const columns = [
    { field: 'isOnfloor', headerName: 'Floor', width: 130, sortable: true },
    { field: 'id', headerName: 'Parking Spot Number', width: 150 },
    {
      field: 'occupied',
      headerName: 'Occupied',
      width: 150,
      renderCell: (params) => (
        <div style={{
          color: params.value ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
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
    </Container>
  );
};

export default ParkingLots;
