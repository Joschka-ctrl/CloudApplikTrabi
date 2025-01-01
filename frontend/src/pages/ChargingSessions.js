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
  Chip
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import { useAuth } from '../components/AuthProvider';

const ChargingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const { getIdToken } = useAuth();

  const fetchSessions = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch('http://localhost:3016/charging-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching charging sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Set up polling every 30 seconds to update session status
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEndSession = async (sessionId) => {
    try {
      const token = await getIdToken();
      // In a real application, you would get the actual energy consumed
      const energyConsumed = Math.floor(Math.random() * 50) + 10; // Mock value between 10-60 kWh
      
      await fetch(`http://localhost:3016/charging-sessions/${sessionId}/end`, {
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
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Charging Sessions
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station Location</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Energy Consumed (kWh)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.stationId}</TableCell>
                  <TableCell>{formatDateTime(session.startTime)}</TableCell>
                  <TableCell>{formatDateTime(session.endTime)}</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={session.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
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
