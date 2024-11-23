const express = require('express');
const parkingService = require('./parkingService');
const admin = require('firebase-admin');
const app = express();
const port = 3033;

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
  
// Create a new parking spot
app.post('/parkingSpotsAuthenticated', authenticateToken,(req, res) => {
    const { id, occupied } = req.body;
    try {
        const newSpot = parkingService.createParkingSpot(id, occupied);
        res.status(201).json(newSpot);
    } catch (error) {
        res.status(400).send(error.message);
    }
});
// Create a new parking spot
app.post('/parkingSpots', (req, res) => {
    const { id, occupied } = req.body;
    try {
        const newSpot = parkingService.createParkingSpot(id, occupied);
        res.status(201).json(newSpot);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
// Get all parking spots
app.get('/parkingSpots', (req, res) => {
    const spots = parkingService.getAllParkingSpots();
    res.json(spots);
});

// tested with postman
// Get a specific parking spot
app.get('/parkingSpots/:id', (req, res) => {
    const spot = parkingService.getParkingSpotById(parseInt(req.params.id));
    if (!spot) return res.status(404).send('Parking spot not found');
    res.json(spot);
});

//tested with postman
app.post("/occupancy", (req, res) => {
    const { id, occupied } = req.body;
    try {
        const result = parkingService.changeOccupancy(id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/duration/:carId", (req, res) => {
    const { carId } = req.params;
    const result = getParkingDuration(carId);
    res.json(result);
});

app.post("/start-parking", (req, res) => {
    const { carId } = req.body;
    const result = startParking(carId);
    res.json(result);
});

app.listen(port, () => {
    console.log("Listening on Port: " + port);
  });