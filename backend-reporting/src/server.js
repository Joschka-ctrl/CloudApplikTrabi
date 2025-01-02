const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const moment = require('moment');
const axios = require('axios');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const app = express();
const PARKING_SERVICE_URL = 'http://localhost:3033';

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
    const response = await axios.get(`${PARKING_SERVICE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling parking service: ${error.message}`);
    throw error;
  }
};

// Get daily parking usage data
app.get('/api/reports/daily-usage', authenticateToken, async (req, res) => {
  try {
    const { parkingId, startDate, endDate, minUsage, maxUsage } = req.query;
    
    let query = db.collection('parking-usage')
      .where('parkingId', '==', parkingId);
    
    if (startDate) {
      query = query.where('date', '>=', moment(startDate).startOf('day').toDate());
    }
    if (endDate) {
      query = query.where('date', '<=', moment(endDate).endOf('day').toDate());
    }

    const snapshot = await query.get();
    let dailyData = {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      data: Array(7).fill(0)
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      if ((!minUsage || data.usage >= parseInt(minUsage)) && 
          (!maxUsage || data.usage <= parseInt(maxUsage))) {
        const dayIndex = moment(data.date.toDate()).day();
        dailyData.data[dayIndex] = data.usage;
      }
    });

    res.json(dailyData);
  } catch (error) {
    console.error('Error fetching daily usage:', error);
    res.status(500).json({ error: 'Failed to fetch daily usage data' });
  }
});

// Get floor occupancy data
app.get('/api/reports/floor-occupancy', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || 'default';

    // Get parking spots data
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
app.get('/api/reports/metrics', authenticateToken, async (req, res) => {
  try {
    const { parkingId: facilityId } = req.query;
    const tenantId = req.user.tenant_id || 'default';

    // Get current occupancy and spots data
    const occupancyData = await parkingServiceRequest(
      `/currentOccupancy/${tenantId}/${facilityId}`,
      req.headers.authorization.split(' ')[1]
    );
    
    const spotsData = await parkingServiceRequest(
      `/parkingSpots/${tenantId}/${facilityId}`,
      req.headers.authorization.split(' ')[1]
    );

    // Calculate metrics
    const occupiedSpots = spotsData.filter(spot => spot.occupied);
    const totalParkedVehicles = occupiedSpots.length;

    // Get average duration for currently parked vehicles
    let totalDuration = 0;
    let validDurations = 0;

    for (const spot of occupiedSpots) {
      if (spot.carId) {
        try {
          const durationData = await parkingServiceRequest(
            `/duration/${tenantId}/${facilityId}/${spot.carId}`,
            req.headers.authorization.split(' ')[1]
          );
          if (durationData.duration) {
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
        'N/A'
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get list of parking places
app.get('/api/reports/parking-places', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('parking-places').get();
    const parkingPlaces = [];

    snapshot.forEach(doc => {
      parkingPlaces.push({
        id: doc.id,
        name: doc.data().name
      });
    });

    res.json(parkingPlaces);
  } catch (error) {
    console.error('Error fetching parking places:', error);
    res.status(500).json({ error: 'Failed to fetch parking places' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Reports service listening on port ${PORT}`);
});
