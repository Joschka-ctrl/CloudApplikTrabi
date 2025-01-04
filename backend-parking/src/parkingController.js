
const express = require('express');
const cors = require("cors");
const parkingService = require('./parkingService.js');
const admin = require('firebase-admin');
const app = express();
const port = 3033;



app.use(express.json());
app.use(cors());

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
    try {
        const { id, occupied } = req.body;
        const newSpot = parkingService.createParkingSpot(id, occupied);
        res.status(201).json(newSpot);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// tested with postman
// Create a new parking spot
app.post('/parkingSpots', async (req, res) => {
    try {
        const { facilityId, tenantId, floor } = req.body;
        const newSpot = await parkingService.createParkingSpot(facilityId, tenantId, floor);
        res.status(201).json(newSpot);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get all parking spots
app.get('/parkingSpots/:tenantid/:facilityid', async (req, res) => {
    try {
        // Extract path parameters
        const { facilityid, tenantid } = req.params;

        // Call the service function
        const spots = await parkingService.getAllParkingSpotsOfFacility(facilityid, tenantid);

        res.json(spots);
    } catch (error) {
        console.error('Error fetching parking spots:', error);
        res.status(500).json({ message: 'Failed to fetch parking spots.' });
    }
});


// tested with postman
// Get a specific parking spot
app.get('/parkingSpot/:id/:tenantid/:facilityid', async (req, res) => {
    try {
        const { id, facilityid, tenantid } = req.params;
        const spot = await parkingService.getParkingSpotById(facilityid, tenantid, id);
        if (!spot) return res.status(404).send('Parking spot not found');
        res.json(spot);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// tested with postman
// Current occupancy of the parking garage
app.get("/currentOccupancy/:tenantid/:facilityid", async (req, res) => {
    try {
        const { facilityid, tenantid } = req.params;
        const occupancy = await parkingService.getCurrentOccupancy(tenantid, facilityid);
        res.json({ occupancy });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});

// Add a car to tone specific parking spot
app.post("/reserveParkingSpot", async (req, res) => {

    try {
        const id = req.body.id;
        const facilityID = req.body.facilityID;
        const tenantID = req.body.tenantID;
        const occupied = true;
        const result = await parkingService.manageParkingSpotOccupancy(tenantID, facilityID, id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Add a car to tone specific parking spot
app.post("/reverseOccupancy", async (req, res) => {

    try {
        const id = req.body.id;
        const facilityID = req.body.facilityID;
        const tenantID = req.body.tenantID;
        const occupied = req.body.occupied;

        const result = await parkingService.reverseOccupancy(tenantID, facilityID, id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Release a specific parking spot
app.post("/releaseParkingSpot", async (req, res) => {
    try {
        const id = req.body.id;
        const facilityID = req.body.facilityID;
        const tenantID = req.body.tenantID;
        const occupied = false;
        const result = await parkingService.manageParkingSpotOccupancy(tenantID, facilityID, id, occupied);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get the duration of a car's stay in the parking garage
app.get("/duration/:tenantid/:facilityid/:carId", async (req, res) => {
    try {
        const { carId, facilityid, tenantid } = req.params;
        const result = await parkingService.getParkingDurationREST(carId, tenantid, facilityid);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Ruten für reporting
app.get('/facilities/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const facilities = await parkingService.getFacilitiesOfTenant(tenantId);
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Einrichtungen.' });
    }

});

app.get('/parkingStats/usage/:tenantId/:facilityId', async (req, res) => {
    try {
    const { tenantId, facilityId } = req.params;
    const { startDate, endDate } = req.query;
    console.log('Query Params:', { startDate, endDate });

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate und endDate sind erforderlich.' });
    }
    const stats = await parkingService.getParkingStats(tenantId, facilityId, startDate, endDate);
    res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Parkplatz-Statistiken.' });
    }
});

app.get('/parkingStats/floors/:tenantId/:facilityId', async (req, res) => {
    const { tenantId, facilityId } = req.params;
    const { startDate, endDate } = req.query;
    console.log('Query Params:', { startDate, endDate });

    // Validierung der Query-Parameter
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate und endDate sind erforderlich.' });
    }

    try {
        // Service-Aufruf zur Berechnung der Stockwerk-Statistiken
        const floorStats = await parkingService.getFloorStats(tenantId, facilityId, startDate, endDate);

        res.json({ floorStats });
    } catch (error) {
        console.error('Fehler beim Abrufen der Stockwerk-Statistiken:', error);
        res.status(500).json({ error: 'Interner Serverfehler.' });
    }
});


app.get('/parkingStats/duration/:tenantId/:facilityId', async (req, res) => {
    const { tenantId, facilityId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate und endDate sind erforderlich.' });
    }

    try {
        const stats = await parkingService.getParkingDurationStats(tenantId, facilityId, startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Parkplatzdauer-Statistiken.' });
    }
});

app.get('/parkingStats/revenue/:tenantId/:facilityId', async (req, res) => {
    const { tenantId, facilityId } = req.params;
    const { startDate, endDate } = req.query;

    console.log('Query Params:', { startDate, endDate });

    // Validierung der Query-Parameter
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate und endDate sind erforderlich.' });
    }

    try {
        // Service-Aufruf zur Berechnung der Umsatz-Statistiken
        const revenueStats = await parkingService.getRevenueStats(tenantId, facilityId, startDate, endDate);

        res.json(revenueStats);
    } catch (error) {
        console.error('Fehler beim Abrufen der Umsatz-Statistiken:', error);
        res.status(500).json({ error: 'Interner Serverfehler.' });
    }
});


/**
 * REST-Endpunkt zum Erstellen einer der Parkplätze für eine Einrichtung.
 * beispielhafter input : 
 * {
    "tenantId": "15",
    "facilityId":"1313",
    "floors": [14, 14, 3],
    "pricePerMinute": 0.1
    }
 */
app.post('/createParkingSpotsForFacility', async (req, res) => {
    const facility = req.body;
    try {
        const createParkingSpotObject = parkingService.createParkingSpotObject(facility.tenantId, facility.facilityId, facility.floors, facility.pricePerMinute);
        const newSpotsForFacility = await parkingService.newParkingSpotsInFacility(createParkingSpotObject);
        res.status(201).json(newSpotsForFacility);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// in Parkhaus fahren
app.get("/getTicketNr/:tenantid/:facilityid", async (req, res) => {
    try {
        const { tenantid, facilityid } = req.params;
        const ticketNr = await parkingService.getTicketNumber(tenantid, facilityid);
        res.json(ticketNr);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Leave the parking garage
app.get("/leaveParkhouse/:tenantid/:facilityid/:carId", async (req, res) => {
    try {
        const { carId, facilityid, tenantid } = req.params;
        const result = await parkingService.leaveParkhouse(carId, tenantid, facilityid);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Pay the parking fee for a car / Ticket number
app.get("/payParkingFee/:tenantid/:facilityid/:carId", async (req, res) => {
    try {
        const { carId, facilityid, tenantid } = req.params;
        const result = await parkingService.payParkingFee(carId, tenantid, facilityid);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get the parking fee for a car / Ticket number
app.get("/getParkingFee/:tenantid/:facilityid/:carId", async (req, res) => {
    try {
        const { carId, facilityid, tenantid } = req.params;
        const result = await parkingService.getParkingFeeRest(carId, tenantid, facilityid);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});



app.listen(port, () => {
    console.log("Listening on Port: " + port);
});