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
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import { useAuth } from '../../../components/AuthProvider';

const ChargingStationTable = ({ stations, onEdit, onRefresh }) => {
  const { user } = useAuth();

  const HOST_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3016' : '/api/echarging';

  const handleStatusChange = async (station) => {
    try {
      const token = await user.getIdToken();
      const newStatus = station.status === 'available' ? 'occupied' : 'available';
      
      await fetch(`${HOST_URL}/charging-stations/${station.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error updating station status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>Garage</TableCell>
            <TableCell>Power (kW)</TableCell>
            <TableCell>Connector Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell>{station.location}</TableCell>
              <TableCell>{station.garage}</TableCell>
              <TableCell>{station.power}</TableCell>
              <TableCell>{station.connectorType}</TableCell>
              <TableCell>
                <Chip
                  label={station.status}
                  color={getStatusColor(station.status)}
                  onClick={() => handleStatusChange(station)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(station)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleStatusChange(station)}
                  color={station.status === 'available' ? 'success' : 'error'}
                >
                  <ElectricCarIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChargingStationTable;
