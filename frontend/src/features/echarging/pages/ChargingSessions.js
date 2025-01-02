import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import { useAuth } from '../../../components/AuthProvider';

const ChargingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState('');
  const [garages, setGarages] = useState([]);
  const { user } = useAuth();

  const HOST_URL = 'http://localhost:3016';

  const fetchSessions = async () => {
    try {
      const token = await user.getIdToken();
      const url = selectedGarage 
        ? `${HOST_URL}/charging-sessions?garage=${encodeURIComponent(selectedGarage)}`
        : `${HOST_URL}/charging-sessions`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSessions(data);

      // Extract unique garages from the sessions
      const uniqueGarages = [...new Set(data.map(session => session.garage))].filter(Boolean);
      setGarages(uniqueGarages);
    } catch (error) {
      console.error('Error fetching charging sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [selectedGarage]); // Re-fetch when garage filter changes

  const handleGarageChange = (event) => {
    setSelectedGarage(event.target.value);
  };

  const handleEndSession = async (sessionId) => {
    try {
      const token = await user.getIdToken();
      // In a real application, you would get the actual energy consumed
      const energyConsumed = Math.floor(Math.random() * 50) + 10; // Mock value between 10-60 kWh
      
      await fetch(`${HOST_URL}/charging-sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ energyConsumed })
      });
      
      fetchSessions();
    } catch (error) {
      console.error('Error ending charging session:', error);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    // Convert Firebase Timestamp to JavaScript Date
    if (timestamp._seconds) {
      const milliseconds = timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000);
      return new Date(milliseconds).toLocaleString('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    }
    return new Date(timestamp).toLocaleString('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Charging Sessions
        </Typography>
        
        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel id="garage-select-label">Filter by Garage</InputLabel>
          <Select
            labelId="garage-select-label"
            id="garage-select"
            value={selectedGarage}
            label="Filter by Garage"
            onChange={handleGarageChange}
          >
            <MenuItem value="">All Garages</MenuItem>
            {garages.map((garage) => (
              <MenuItem key={garage} value={garage}>{garage}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>Garage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Energy Consumed</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.stationId}</TableCell>
                  <TableCell>{session.garage}</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={session.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(session.startTime)}</TableCell>
                  <TableCell>{formatDateTime(session.endTime)}</TableCell>
                  <TableCell>{session.energyConsumed || '-'}</TableCell>
                  <TableCell>
                    {session.status === 'active' && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleEndSession(session.id)}
                      >
                        End Session
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ChargingSessions;
