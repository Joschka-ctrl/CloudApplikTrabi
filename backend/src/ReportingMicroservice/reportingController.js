const express = require('express');
const reportingService = require('./reportingService');
const admin = require('firebase-admin');
const app = express();
const port = 3034;

app.use(express.json());

// Middleware zur Authentifizierung
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized access attempt detected');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const token = authHeader.split(' ')[1];
  
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
  

app.get('/reports/occupacy/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getOccupancyReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/duration/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getDurationReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/defects/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getDefectsReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/revenue/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getRevenueReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/occupancy-rate/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getOccupancyRateReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/average-parking-time/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getAverageParkingTimeReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/peak-hours/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getPeakHoursReport(parkingSpaceID);
    res.status(200).json(result);
});

app.get('/reports/violations/:parkingSpaceID', async (req, res) => {
    const { parkingSpaceID } = req.params;
    const result = await reportingService.getViolationsReport(parkingSpaceID);
    res.status(200).json(result);
});


app.listen(port, () => {
    console.log("Listening on Port: " + port);
  });