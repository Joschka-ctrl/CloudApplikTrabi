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
app.post("/charging-sessions", async (req, res) => {
  try {
    const { stationId, userId, chargingCardProvider } = req.body;

    // Check station status first
    const stationRef = db.collection("charging-stations").doc(stationId);
    const stationDoc = await stationRef.get();
    
    if (!stationDoc.exists) {
      return res.status(404).json({ error: "Charging station not found" });
    }

    const stationData = stationDoc.data();
    if (stationData.status === 'maintenance') {
      return res.status(400).json({ error: "Cannot start charging session. Station is under maintenance." });
    }

    const session = {
      stationId: String(stationId),
      userId: String(userId),
      chargingCardProvider: String(chargingCardProvider || 'ec-card'),
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      endTime: null,
      energyConsumed: 0
    };
    
    // Update charging station status to occupied
    await stationRef.update({
      status: 'occupied',
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const docRef = await db.collection("charging-sessions").add(session);
    res.status(201).json({ id: docRef.id, ...session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End charging session
app.patch("/charging-sessions/:id/end", async (req, res) => {
  try {
    const { energyConsumed } = req.body;
    const sessionRef = db.collection("charging-sessions").doc(req.params.id);
    
    // Get the session to find the station ID
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Charging session not found" });
    }
    const sessionData = sessionDoc.data();
    
    // Update the charging station status to available
    const stationRef = db.collection("charging-stations").doc(sessionData.stationId);
    await stationRef.update({
      status: 'available',
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update the charging session
    await sessionRef.update({
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      energyConsumed: energyConsumed,
      status: 'completed'
    });

    const updated = await sessionRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get provider rates
app.get("/provider-rates", async (req, res) => {
  try {
    const ratesSnapshot = await db.collection("provider-rates").get();
    const rates = [];
    ratesSnapshot.forEach(doc => {
      rates.push({ id: doc.id, ...doc.data() });
    });
    res.json(rates);
  } catch (error) {
    console.error("Error getting provider rates:", error);
    res.status(500).json({ error: "Failed to get provider rates" });
  }
});

// Update or create provider rate
app.post("/provider-rates", async (req, res) => {
  try {
    const { provider, ratePerKw } = req.body;
    const rateRef = db.collection("provider-rates").doc(provider);
    await rateRef.set({
      provider,
      ratePerKw: Number(ratePerKw),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating provider rate:", error);
    res.status(500).json({ error: "Failed to update provider rate" });
  }
});

// Get billing summary
app.get("/billing-summary", async (req, res) => {
  try {
    // Get all completed charging sessions
    const sessionsSnapshot = await db.collection("charging-sessions")
      .where("status", "==", "completed")
      .get();
    
    // Get all provider rates
    const ratesSnapshot = await db.collection("provider-rates").get();
    const rates = {};
    ratesSnapshot.forEach(doc => {
      rates[doc.id] = doc.data().ratePerKw;
    });

    // Calculate billing per provider
    const billing = {};
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      const provider = session.chargingCardProvider || 'ec-card';
      const rate = rates[provider] || rates['ec-card'] || 0;
      const amount = (session.energyConsumed || 0) * rate;

      if (!billing[provider]) {
        billing[provider] = {
          totalEnergy: 0,
          totalAmount: 0,
          sessions: 0
        };
      }
      
      billing[provider].totalEnergy += session.energyConsumed || 0;
      billing[provider].totalAmount += amount;
      billing[provider].sessions += 1;
    });

    res.json(billing);
  } catch (error) {
    console.error("Error getting billing summary:", error);
    res.status(500).json({ error: "Failed to get billing summary" });
  }
});

app.listen(port, () => {
  console.log(`E-Charging microservice running on port ${port}`);
});
