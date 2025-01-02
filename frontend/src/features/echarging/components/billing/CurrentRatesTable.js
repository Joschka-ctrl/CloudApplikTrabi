import React from 'react';
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';

const CurrentRatesTable = ({ providerRates }) => {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Current Provider Rates
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Rate per kW (€)</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providerRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{rate.provider}</TableCell>
                <TableCell>{rate.ratePerKw.toFixed(2)} €</TableCell>
                <TableCell>
                  {rate.updatedAt ? new Date(rate.updatedAt._seconds * 1000).toLocaleString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CurrentRatesTable;
