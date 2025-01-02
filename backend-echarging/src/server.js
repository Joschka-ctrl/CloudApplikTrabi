const express = require("express");
const cors = require("cors");
const admin = require('firebase-admin');
const app = express();
const port = 3016; // Different port from main backend

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Unauthorized access attempt detected');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

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

// Get all charging stations
app.get("/charging-stations", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("charging-stations").get();
    const stations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific charging station
app.get("/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const doc = await db.collection("charging-stations").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Charging station not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new charging station
app.post("/charging-stations", authenticateToken, async (req, res) => {
  try {
    const { location, power, status, connectorType } = req.body;
    const newStation = {
      location,
      power,
      status,
      connectorType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection("charging-stations").add(newStation);
    res.status(201).json({ id: docRef.id, ...newStation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update charging station status
app.patch("/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const stationRef = db.collection("charging-stations").doc(req.params.id);
    
    await stationRef.update({
      status,
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updated = await stationRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all charging sessions
app.get("/charging-sessions", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("charging-sessions").get();
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start charging session
app.post("/charging-sessions", authenticateToken, async (req, res) => {
  try {
    const { stationId, userId } = req.body;
    const session = {
      stationId,
      userId,
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      endTime: null,
      energyConsumed: 0
    };
    
    const docRef = await db.collection("charging-sessions").add(session);
    res.status(201).json({ id: docRef.id, ...session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End charging session
app.patch("/charging-sessions/:id/end", authenticateToken, async (req, res) => {
  try {
    const { energyConsumed } = req.body;
    const sessionRef = db.collection("charging-sessions").doc(req.params.id);
    
    await sessionRef.update({
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
      energyConsumed
    });
    
    const updated = await sessionRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`E-Charging microservice running on port ${port}`);
});
