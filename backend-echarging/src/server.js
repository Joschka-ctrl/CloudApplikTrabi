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
    const garageFilter = req.query.garage;
    let query = db.collection("charging-stations");
    
    if (garageFilter) {
      query = query.where("garage", "==", garageFilter);
    }
    
    const snapshot = await query.get();
    const stations = [];
    snapshot.forEach(doc => {
      stations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(stations);
  } catch (error) {
    console.error("Error getting charging stations:", error);
    res.status(500).json({ error: "Failed to get charging stations" });
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
    const { location, power, status, connectorType, garage } = req.body;

    if (!location || !power || !connectorType || !garage) {
      return res.status(400).json({ 
        error: "Missing required fields. Location, power, connector type, and garage are required." 
      });
    }

    const newStation = {
      location: location,
      power: Number(power),
      status: status || 'available',
      connectorType: connectorType,
      garage: garage,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("charging-stations").add(newStation);
    res.status(201).json({ id: docRef.id, ...newStation });
  } catch (error) {
    console.error('Error creating charging station:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update charging station
app.patch("/charging-stations/:id", authenticateToken, async (req, res) => {
  try {
    const { location, power, status, connectorType, garage } = req.body;
    const stationRef = db.collection("charging-stations").doc(req.params.id);
    
    const updateData = {
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    };

    // Only include fields that are provided in the request
    if (location) updateData.location = location;
    if (power) updateData.power = Number(power);
    if (status) updateData.status = status;
    if (connectorType) updateData.connectorType = connectorType;
    if (garage) updateData.garage = garage;
    
    await stationRef.update(updateData);
    
    const updated = await stationRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating charging station:', error);
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

    if (stationData.status === 'occupied') {
      return res.status(400).json({ error: "Cannot start charging session. Station is already occupied." });
    }

    const session = {
      stationId: String(stationId),
      userId: String(userId),
      chargingCardProvider: String(chargingCardProvider || 'ec-card'),
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      endTime: null,
      energyConsumed: 0,
      garage: stationData.garage
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
    // Get garage filter from query params
    const garageFilter = req.query.garage;
    
    // Get all completed charging sessions
    let query = db.collection("charging-sessions")
      .where("status", "==", "completed");
    
    if (garageFilter) {
      query = query.where("garage", "==", garageFilter);
    }
    
    const sessionsSnapshot = await query.get();
    
    // Get all provider rates
    const ratesSnapshot = await db.collection("provider-rates").get();
    const rates = {};
    ratesSnapshot.forEach(doc => {
      rates[doc.data().provider] = doc.data().ratePerKw;
    });

    // Process billing data
    const billingSummary = {};
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      const provider = session.chargingCardProvider;
      const rate = rates[provider] || 0;
      const amount = session.energyConsumed * rate;

      if (!billingSummary[provider]) {
        billingSummary[provider] = {
          totalEnergy: 0,
          totalAmount: 0,
          sessions: 0,
          garage: session.garage
        };
      }

      billingSummary[provider].totalEnergy += session.energyConsumed;
      billingSummary[provider].totalAmount += amount;
      billingSummary[provider].sessions += 1;
    });

    res.json(billingSummary);
  } catch (error) {
    console.error("Error getting billing summary:", error);
    res.status(500).json({ error: "Failed to get billing summary" });
  }
});

// Get charging statistics for reporting
app.get("/api/reports/charging-stats", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    let query = db.collection("charging-sessions");
    
    if (garage) {
      query = query.where("garage", "==", garage);
    }
    
    if (startDate) {
      query = query.where("startTime", ">=", new Date(startDate));
    }
    
    if (endDate) {
      query = query.where("endTime", "<=", new Date(endDate));
    }
    
    const snapshot = await query.get();
    const stats = {
      totalSessions: 0,
      totalDuration: 0,
      totalEnergy: 0,
      averageSessionDuration: 0,
      averageEnergyPerSession: 0
    };
    
    snapshot.forEach(doc => {
      const session = doc.data();
      stats.totalSessions++;
      stats.totalDuration += (session.endTime - session.startTime) / (1000 * 60 * 60); // Convert to hours
      stats.totalEnergy += session.energyConsumed || 0;
    });
    
    if (stats.totalSessions > 0) {
      stats.averageSessionDuration = stats.totalDuration / stats.totalSessions;
      stats.averageEnergyPerSession = stats.totalEnergy / stats.totalSessions;
    }
    
    res.json(stats);
  } catch (error) {
    console.error("Error getting charging statistics:", error);
    res.status(500).json({ error: "Failed to get charging statistics" });
  }
});

// Get station utilization data
app.get("/api/reports/station-utilization", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    
    // First get all stations
    let stationsQuery = db.collection("charging-stations");
    if (garage) {
      stationsQuery = stationsQuery.where("garage", "==", garage);
    }
    const stationsSnapshot = await stationsQuery.get();
    
    // Then get sessions for each station
    const utilizationData = [];
    const startDateTime = startDate ? new Date(startDate) : new Date(0);
    const endDateTime = endDate ? new Date(endDate) : new Date();
    
    for (const stationDoc of stationsSnapshot.docs) {
      // Get all sessions for this station
      let sessionsQuery = db.collection("charging-sessions")
        .where("stationId", "==", stationDoc.id);
      
      const sessionsSnapshot = await sessionsQuery.get();
      
      const stationData = {
        stationId: stationDoc.id,
        location: stationDoc.data().location,
        totalSessions: 0,
        totalHoursUsed: 0,
        utilization: 0
      };
      
      // Filter sessions by date in memory
      sessionsSnapshot.forEach(sessionDoc => {
        const session = sessionDoc.data();
        const sessionStart = session.startTime.toDate();
        const sessionEnd = session.endTime.toDate();
        
        // Check if session falls within the date range
        if (sessionStart >= startDateTime && sessionEnd <= endDateTime) {
          stationData.totalSessions++;
          const duration = (sessionEnd - sessionStart) / (1000 * 60 * 60); // Convert to hours
          stationData.totalHoursUsed += duration;
        }
      });
      
      // Calculate utilization percentage
      const totalPossibleHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      stationData.utilization = (stationData.totalHoursUsed / totalPossibleHours) * 100;
      
      utilizationData.push(stationData);
    }
    
    res.json(utilizationData);
  } catch (error) {
    console.error("Error getting station utilization:", error);
    res.status(500).json({ error: "Failed to get station utilization data" });
  }
});

// Get card provider revenue statistics
app.get("/api/reports/card-provider-revenue", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, garage } = req.query;
    
    // First get all provider rates
    const providerRatesSnapshot = await db.collection("provider-rates").get();
    const providerRates = {};
    providerRatesSnapshot.forEach(doc => {
      providerRates[doc.id] = doc.data().ratePerKw || 0;
    });
    
    // Then get charging sessions
    let query = db.collection("charging-sessions");
    
    if (garage) {
      query = query.where("garage", "==", garage);
    }
    
    if (startDate) {
      query = query.where("startTime", ">=", new Date(startDate));
    }
    
    if (endDate) {
      query = query.where("endTime", "<=", new Date(endDate));
    }
    
    const snapshot = await query.get();
    const providerStats = {};
    
    snapshot.forEach(doc => {
      const session = doc.data();
      const provider = session.chargingCardProvider || 'Unknown';
      const energyConsumed = session.energyConsumed || 0;
      const ratePerKw = providerRates[provider] || 0;
      const revenue = energyConsumed * ratePerKw;
      
      if (!providerStats[provider]) {
        providerStats[provider] = {
          totalRevenue: 0,
          totalSessions: 0,
          totalEnergy: 0,
          averageRevenuePerSession: 0,
          ratePerKw: 0
        };
      }
      
      providerStats[provider].totalRevenue += revenue;
      providerStats[provider].totalSessions += 1;
      providerStats[provider].totalEnergy += energyConsumed;
      providerStats[provider].ratePerKw = ratePerKw;
    });
    
    // Calculate averages
    Object.keys(providerStats).forEach(provider => {
      const stats = providerStats[provider];
      stats.averageRevenuePerSession = stats.totalRevenue / stats.totalSessions;
    });
    
    res.json(providerStats);
  } catch (error) {
    console.error("Error getting card provider revenue:", error);
    res.status(500).json({ error: "Failed to get card provider revenue data" });
  }
});

app.listen(port, () => {
  console.log(`E-Charging microservice running on port ${port}`);
});
