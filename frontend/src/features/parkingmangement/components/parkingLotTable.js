import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useAuth } from '../../../components/AuthProvider';

const ParkingLotTable = ({ parkingFacility, onEdit, onRefresh }) => {
  const { user } = useAuth();

  const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/parking';

  const handleSpotStatusChange = async (spotId, occupied) => {
    try {
      const token = await user.getIdToken();
      const newStatus = !occupied;

      await fetch(`${HOST_URL}/parking-spots/${spotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ occupied: newStatus })
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating parking spot status:', error);
    }
  };

  const getStatusColor = (occupied) => (occupied ? 'error' : 'success');

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Spot ID</TableCell>
            <TableCell>Floor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parkingFacility.parkingSpacesOnFloor.map((floor, floorIndex) => (
            floor.spots.map((spot) => (
              <TableRow key={spot.id}>
                <TableCell>{spot.id}</TableCell>
                <TableCell>{floorIndex + 1}</TableCell>
                <TableCell>
                  <Chip
                    label={spot.occupied ? 'Occupied' : 'Available'}
                    color={getStatusColor(spot.occupied)}
                    onClick={() => handleSpotStatusChange(spot.id, spot.occupied)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(spot)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleSpotStatusChange(spot.id, spot.occupied)}
                    color={spot.occupied ? 'error' : 'success'}
                  >
                    <LocalParkingIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ParkingLotTable;
