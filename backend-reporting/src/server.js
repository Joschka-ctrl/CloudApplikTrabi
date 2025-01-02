const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const moment = require('moment');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const app = express();

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
    req.user = decodedToken; // Benutzerdaten für spätere Verwendung verfügbar
    console.log('Token of user ' + decodedToken.uid + ' verified successfully');
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
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
    const { parkingId } = req.query;
    
    const snapshot = await db.collection('floor-occupancy')
      .where('parkingId', '==', parkingId)
      .orderBy('floor')
      .get();

    const occupancyData = {
      labels: [],
      data: []
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      occupancyData.labels.push(`${data.floor} Floor`);
      occupancyData.data.push(data.occupancy);
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
    const { parkingId, startDate, endDate } = req.query;
    
    let query = db.collection('parking-usage')
      .where('parkingId', '==', parkingId);
    
    if (startDate) {
      query = query.where('date', '>=', moment(startDate).startOf('day').toDate());
    }
    if (endDate) {
      query = query.where('date', '<=', moment(endDate).endOf('day').toDate());
    }

    const snapshot = await query.get();
    let totalVehicles = 0;
    let totalDuration = 0;
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalVehicles += data.totalVehicles || 0;
      if (data.averageDuration) {
        totalDuration += data.averageDuration;
        count++;
      }
    });

    const averageDuration = count > 0 ? moment.duration(totalDuration / count, 'minutes') : 0;

    res.json({
      totalParkedVehicles: totalVehicles,
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
