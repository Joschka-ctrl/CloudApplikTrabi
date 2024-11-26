
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

// unused
// Create a new parking spot
app.post('/parkingSpotsAuthenticated', authenticateToken, (req, res) => {
    const { id, occupied } = req.body;
    try {
        const newSpot = parkingService.createParkingSpot(id, occupied);
        res.status(201).json(newSpot);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
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

// tested with postman
// in Parkhaus fahren
app.get("/getTicketNr", (req, res) => {
    try {
        const ticketNr = parkingService.getTicketNumber();
        res.json({ ticketNr });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// tested with postman
// Current occupancy of the parking garage
app.get("/currentOccupancy", (req, res) => {
    const occupancy = parkingService.getCurrentOccupancy();
    res.json({ occupancy });
});


//tested with postman
// Add a car to tone specific parking spot
app.post("/reserveParkingSpot", (req, res) => {
    const id = req.body.id;
    const occupied = true;
    try {
        const result = parkingService.manageParkingSpotOccupancy(id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//tested with postman
// Release a specific parking spot
app.post("/releaseParkingSpot", (req, res) => {
    const id = req.body.id;
    const occupied = false;
    try {
        const result = parkingService.manageParkingSpotOccupancy(id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//tested with postman
// Get the duration of a car's stay in the parking garage
app.get("/duration/:carId", (req, res) => {
    try {
        const carId = req.params.carId;
        const result = parkingService.getParkingDuration(carId);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
// Get the parking fee for a car / Ticket number
app.get("/getParkingFee/:carId", (req, res) => {
    try {
        const carId = req.params.carId;
        const result = parkingService.getParkingFee(carId);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
// Pay the parking fee for a car / Ticket number
app.get("/payParkingFee/:carId", (req, res) => {
    try {
        const carId = req.params.carId;
        const result = parkingService.payParkingFee(carId);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
// Leave the parking garage
app.get("/leaveParkhouse/:carId", (req, res) => {
    try {
        const ticketNumber = req.params.carId;
        const result = parkingService.leaveParkhouse(ticketNumber);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.listen(port, () => {
    console.log("Listening on Port: " + port);
});