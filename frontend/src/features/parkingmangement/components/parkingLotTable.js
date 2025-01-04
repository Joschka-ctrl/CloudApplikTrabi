import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3016' : '/api/echarging';

const ParkingLotForm = ({ open, onClose, tenantId }) => {
  const [facilities, setFacilities] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${HOST_URL}/facilities/${tenantId}`);
        const data = await response.json();
        setFacilities(data);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchFacilities();
    }
  }, [open, tenantId]);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        setLoading(true);
        const facilityId = facilities.length ? facilities[0].id : 'defaultFacilityId';
        const response = await fetch(`${HOST_URL}/parkingSpots/${tenantId}/${facilityId}`);
        const data = await response.json();
        setParkingSpots(data);
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      } finally {
        setLoading(false);
      }
    };

    if (facilities.length > 0) {
      fetchParkingSpots();
    }
  }, [facilities, tenantId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Parking Spots</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {parkingSpots.map((spot) => (
              <ListItem key={spot.id}>
                <ListItemText
                  primary={`Spot ID: ${spot.id}`}
                  secondary={`Occupied: ${spot.occupied ? 'Yes' : 'No'}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ParkingLotForm;
