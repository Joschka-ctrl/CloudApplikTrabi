import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Link
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { format } from 'date-fns';
import { useAuth } from '../../../components/AuthProvider';

const DailyReportsList = ({ tenantId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:3004' : '';
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${HOST}/api/reporting/daily-list?tenantId=${tenantId}`,
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        setReports(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchReports();
    }
  }, [tenantId, user.accessToken, HOST]);

  const handleDownload = async (docId) => {
    try {
      const response = await fetch(
        `${HOST}/api/reporting/daily/document/${docId}?tenantId=${tenantId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  if (loading) {
    return <Typography>Loading reports...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (reports.length === 0) {
    return <Typography>No reports available</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Daily Reports
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell>Total Cars</TableCell>
              <TableCell>Average Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleDownload(report.id)}
                    sx={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    {`Report ${format(new Date(report.date), 'dd.MM.yyyy')}`}
                  </Link>
                </TableCell>
                <TableCell>{report.facilityId}</TableCell>
                <TableCell>{report.totalCarsInFacility || 0}</TableCell>
                <TableCell>{report.averageParkingDuration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DailyReportsList;
