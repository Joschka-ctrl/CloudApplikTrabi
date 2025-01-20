const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const nanoid = require("nanoid");
const { sendNewFacility } = require("./serviceToService");
const app = express();
app.use(cors());
app.use(express.json());
const port = 3021;
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'trabantparking-stage'
});
admin.firestore().settings({
    databaseId: "facilities",
});
const db = admin.firestore();

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

// Routes
app.post("/api/facilities/:tenantId", authenticateToken,async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    console.log("POST /facility");
    try {
        const facilityId = nanoid.nanoid();
        const tenantId = req.params.tenantId;
        const body = req.body;
        if (!body || typeof body !== "object") {
            res.status(400).send("Invalid request body");
            return;
        }
        // Validate required fields based on Facility interface
        if (!body.name || typeof body.name !== "string") {
            res.status(400).send("Invalid facility data: name is required");
            return;
        }
        console.log('Saving Facility');
        const data = body;
        data.facilityId = facilityId;
        data.tenantId = tenantId;
        db.collection("facilities")
            .add(data)
            .then((docRef) => {
            res.status(201).send(`Facility added with ID: ${docRef.id}`);
            sendNewFacility(data, token);
        });
        console.log('Facility saved');
    }
    catch (error) {
        res.status(500).send(`Error adding facility: ${error.message}`);
    }
});
//Update facility
app.put("/api/facilities/:tenantId/:id", authenticateToken, async (req, res) => {
    console.log("PUT facility");
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).send("Invalid facility ID");
            return;
        }
        const body = req.body;
        if (!body || typeof body !== "object") {
            res.status(400).send("Invalid request body");
            return;
        }
        // Validate required fields based on Facility interface
        if (!body.name || typeof body.name !== "string") {
            res.status(400).send("Invalid facility data: name is required");
            return;
        }
        const data = body;
        const snapshot = await db.collection("facilities").where("facilityId", "==", id).get();
        if (snapshot.empty) {
            res.status(404).send(`Facility ${id} not found`);
            return;
        }
        const docRef = snapshot.docs[0].ref;
        if((await docRef.get()).data().tenantId !== req.params.tenantId){
            res.status(403).send(`Unauthorized access to facility ${id}`);
            return;
        }
        await docRef.set(data, { merge: true });
        res.status(200).send(`Facility updated with ID: ${id}`);
    }
    catch (error) {
        res.status(500).send(`Error updating facility: ${error.message}`);
    }
});
//Get facility
app.get("/api/facilities/:tenantId/:id", authenticateToken, async (req, res) => {
    console.log("GET facility");
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).send("Invalid facility ID");
            return;
        }
        const snapshot = await db.collection("facilities").where("facilityId", "==", id).get();
        if (snapshot.empty) {
            res.status(404).send(`Facility ${id} not found`);
            return;
        }
        const doc = snapshot.docs[0].ref;
        const data = (await doc.get()).data();
        if(data.tenantId !== req.params.tenantId){
            res.status(403).send(`Unauthorized access to facility ${id}`);
            return;
        }
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).send(`Error retrieving facility: ${error.message}`);
    }
});
//Delete facility
app.delete("/api/facilities/:tenantId/:id", authenticateToken, async (req, res) => {
    console.log("DELETE facility");
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).send("Invalid facility ID");
            return;
        }
        const snapshot = await db.collection("facilities").where("facilityId", "==", id).get();
        if (snapshot.empty) {
            res.status(404).send(`Facility ${id} not found`);
            return;
        }
        const doc = snapshot.docs[0].ref;
        if((await doc.get()).data().tenantId !== req.params.tenantId){
            res.status(403).send(`Unauthorized access to facility ${id}`);
            return;
        }
        await doc.delete();
        res.status(200).send(`Facility deleted with ID: ${id}`);
    }
    catch (error) {
        res.status(500).send(`Error deleting facility: ${error.message}`);
    }
});

//Get all facilities
app.get("/api/facilities/:tenantId", authenticateToken, async (req, res) => {
    console.log("GET facilities");
    try {
        const snapshot = await db.collection("facilities").where("tenantId", "==", req.params.tenantId).limit(100).get();
        const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).json(documents);
    }
    catch (error) {
        res.status(500).send(`Error retrieving facilities: ${error.message}`);
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    db.collection("facilities").limit(1).get()
        .then(() => {
        console.log("Firestore connection is valid");
    })
        .catch((error) => {
        console.error("Error validating Firestore connection:", error);
    });
});
