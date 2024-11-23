const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

let parkingSpots = [
    { id: 1, occupied: false },
    { id: 2, occupied: false },
    { id: 3, occupied: false },
    { id: 4, occupied: false },
    { id: 5, occupied: false }
];

// Get all parking spots
app.get('/parkingSpots', (req, res) => {
    res.json(parkingSpots);
});

// Get a specific parking spot
app.get('/parkingSpots/:id', (req, res) => {
    const spot = parkingSpots.find(s => s.id === parseInt(req.params.id));
    if (!spot) return res.status(404).send('Parking spot not found');
    res.json(spot);
});

// Occupy a parking spot
app.post('/parkingSpots/:id/occupy', (req, res) => {
    const spot = parkingSpots.find(s => s.id === parseInt(req.params.id));
    if (!spot) return res.status(404).send('Parking spot not found');
    if (spot.occupied) return res.status(400).send('Parking spot already occupied');
    spot.occupied = true;
    res.json(spot);
});

// Vacate a parking spot
app.post('/parkingSpots/:id/vacate', (req, res) => {
    const spot = parkingSpots.find(s => s.id === parseInt(req.params.id));
    if (!spot) return res.status(404).send('Parking spot not found');
    if (!spot.occupied) return res.status(400).send('Parking spot already vacant');
    spot.occupied = false;
    res.json(spot);
});

app.listen(port, () => {
    console.log(`Parking service running on port ${port}`);
});