const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const moment = require('moment');
const axios = require('axios');
require('dotenv').config();

if(process.env.NODE_ENV === 'development') {
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
}
else {
  const firebaseConfig = {
    apiKey: process.env.AUTH_API_KEY,
    authDomain: process.env.PROJECT_ID + ".firebaseapp.com",
    projectId: process.env.PROJECT_ID,
  };
  admin.initializeApp(firebaseConfig);
}

const db = admin.firestore();
const app = express();
const router = express.Router();
const PARKING_SERVICE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : '/api/parking';
const ECHARGING_SERVICE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3016' : '/api/echarging';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware zur Authentifizierung
const authenticateToken = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith('Bearer ')) {
    console.log('Unauthorized access attempt detected');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log('Token of user ' + decodedToken.uid + ' verified successfully');
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Helper function to make authenticated requests to parking service
const parkingServiceRequest = async (endpoint, token) => {
  try {
    console.log(`Calling parking service: ${PARKING_SERVICE_URL}${endpoint}`);
    const response = await axios.get(`${PARKING_SERVICE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling parking service: ${error.message}`);
    throw error;
  }
};

// Helper function to make authenticated requests to e-charging service
const eChargingServiceRequest = async (endpoint, token) => {
  try {
    const response = await axios.get(`${ECHARGING_SERVICE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling e-charging service: ${error.message}`);
    throw error;
  }
};

// Health check endpoint
app.get("/api/reporting/health", (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Use router with base path
app.use('/api/reporting', router);
app.use('/', router);

// Get daily parking usage data
router.get('/api/reports/daily-usage', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (!startDate || !endDate) {
      startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      endDate = moment().format('YYYY-MM-DD');
    }

    const usageData = await parkingServiceRequest(
      `/parkingStats/usage/${tenantId}/${facilityId}?startDate=${startDate}&endDate=${endDate}`,
      req.headers.authorization.split(' ')[1]
    );

    res.json(usageData);
  } catch (error) {
    console.error('Error fetching daily usage:', error);
    res.status(500).json({ error: 'Failed to fetch daily usage data' });
  }
});

// Get floor occupancy data
router.get('/api/reports/floor-occupancy', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';

    // Get all parking spots
    const spotsData = await parkingServiceRequest(
      `/parkingSpots/${tenantId}/${facilityId}`,
      req.headers.authorization.split(' ')[1]
    );

    // Group spots by floor and calculate occupancy
    const floorOccupancy = spotsData.reduce((acc, spot) => {
      const floor = spot.floor || '1';
      if (!acc[floor]) {
        acc[floor] = { total: 0, occupied: 0 };
      }
      acc[floor].total++;
      if (spot.occupied) {
        acc[floor].occupied++;
      }
      return acc;
    }, {});

    // Format data for frontend
    const occupancyData = {
      labels: [],
      data: []
    };

    Object.entries(floorOccupancy).forEach(([floor, data]) => {
      occupancyData.labels.push(`Floor ${floor}`);
      occupancyData.data.push((data.occupied / data.total) * 100);
    });

    res.json(occupancyData);
  } catch (error) {
    console.error('Error fetching floor occupancy:', error);
    res.status(500).json({ error: 'Failed to fetch floor occupancy data' });
  }
});

// Get parking metrics
router.get('/api/reports/metrics', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';

    // Get all parking spots and current occupancy
    const [spotsData, occupancyData] = await Promise.all([
      parkingServiceRequest(
        `/parkingSpots/${tenantId}/${facilityId}`,
        req.headers.authorization.split(' ')[1]
      ),
      parkingServiceRequest(
        `/currentOccupancy/${tenantId}/${facilityId}`,
        req.headers.authorization.split(' ')[1]
      )
    ]);

    // Calculate total parked vehicles
    const occupiedSpots = spotsData.filter(spot => spot.occupied);
    const totalParkedVehicles = occupiedSpots.length;

    // Calculate average duration for currently parked vehicles
    let totalDuration = 0;
    let validDurations = 0;

    for (const spot of occupiedSpots) {
      if (spot.carId) {
        try {
          const durationData = await parkingServiceRequest(
            `/duration/${tenantId}/${facilityId}/${spot.carId}`,
            req.headers.authorization.split(' ')[1]
          );
          if (durationData && durationData.duration) {
            totalDuration += durationData.duration;
            validDurations++;
          }
        } catch (error) {
          console.error(`Error fetching duration for car ${spot.carId}:`, error);
        }
      }
    }

    const averageDuration = validDurations > 0 ? 
      moment.duration(totalDuration / validDurations, 'minutes') : null;

    res.json({
      totalParkedVehicles,
      averageDuration: averageDuration ? 
        `${Math.floor(averageDuration.asHours())} hours ${averageDuration.minutes()} minutes` : 
        'N/A',
      currentOccupancy: occupancyData.occupancy || 0
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get list of parking places (facilities)
router.get('/api/reports/parking-places', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id || '1';
    const facilities = await parkingServiceRequest(
      `/facilities/${tenantId}`,
      req.headers.authorization.split(' ')[1]
    );
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching parking places:', error);
    res.status(500).json({ error: 'Failed to fetch parking places' });
  }
});

// Get e-charging statistics
router.get('/api/reports/echarging/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    const token = req.headers.authorization.split(' ')[1];

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (garage) queryParams.append('garage', garage);

    const stats = await eChargingServiceRequest(
      `/api/reports/charging-stats?${queryParams.toString()}`,
      token
    );

    res.json(stats);
  } catch (error) {
    console.error('Error fetching e-charging statistics:', error);
    res.status(500).json({ error: 'Failed to fetch e-charging statistics' });
  }
});

// Get station utilization data
router.get('/api/reports/echarging/utilization', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    const token = req.headers.authorization.split(' ')[1];

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (garage) queryParams.append('garage', garage);

    const utilizationData = await eChargingServiceRequest(
      `/api/reports/station-utilization?${queryParams.toString()}`,
      token
    );

    res.json(utilizationData);
  } catch (error) {
    console.error('Error fetching station utilization:', error);
    res.status(500).json({ error: 'Failed to fetch station utilization data' });
  }
});

// Get card provider revenue data
router.get('/api/reports/echarging/card-provider-revenue', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    const token = req.headers.authorization.split(' ')[1];

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (garage) queryParams.append('garage', garage);

    const providerStats = await eChargingServiceRequest(
      `/api/reports/card-provider-revenue?${queryParams.toString()}`,
      token
    );

    res.json(providerStats);
  } catch (error) {
    console.error('Error fetching card provider revenue:', error);
    res.status(500).json({ error: 'Failed to fetch card provider revenue data' });
  }
});

// Get parking duration statistics
router.get('/api/reports/parking-duration', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';
    const { startDate, endDate } = req.query;

    const durationStats = await parkingServiceRequest(
      `/parkingStats/duration/${tenantId}/${facilityId}?startDate=${startDate}&endDate=${endDate}`,
      req.headers.authorization.split(' ')[1]
    );

    res.json(durationStats);
  } catch (error) {
    console.error('Error fetching parking duration stats:', error);
    res.status(500).json({ error: 'Failed to fetch parking duration statistics' });
  }
});

// Get revenue statistics
router.get('/api/reports/parking-revenue', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';
    const { startDate, endDate } = req.query;

    const revenueStats = await parkingServiceRequest(
      `/parkingStats/revenue/${tenantId}/${facilityId}?startDate=${startDate}&endDate=${endDate}`,
      req.headers.authorization.split(' ')[1]
    );

    res.json(revenueStats);
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: 'Failed to fetch revenue statistics' });
  }
});

// Get floor statistics
router.get('/api/reports/floor-stats', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || '1';
    const { startDate, endDate } = req.query;

    const floorStats = await parkingServiceRequest(
      `/parkingStats/floors/${tenantId}/${facilityId}?startDate=${startDate}&endDate=${endDate}`,
      req.headers.authorization.split(' ')[1]
    );

    res.json(floorStats);
  } catch (error) {
    console.error('Error fetching floor stats:', error);
    res.status(500).json({ error: 'Failed to fetch floor statistics' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Reports service listening on port ${PORT}`);
});
