const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const nanoid = require("nanoid");
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
// Routes
app.post("/api/facilities", async (req, res) => {
    console.log("POST /facility");
    try {
        const facilityId = nanoid(16);
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
        db.collection("facilities")
            .add(data)
            .then((docRef) => {
            res.status(201).send(`Facility added with ID: ${docRef.id}`);
        });
        console.log('Facility saved');
    }
    catch (error) {
        res.status(500).send(`Error adding facility: ${error.message}`);
    }
});
//Update facility
app.put("/api/facilities/:id", async (req, res) => {
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
        await docRef.set(data, { merge: true });
        res.status(200).send(`Facility updated with ID: ${id}`);
    }
    catch (error) {
        res.status(500).send(`Error updating facility: ${error.message}`);
    }
});
//Get facility
app.get("/api/facilities/:id", async (req, res) => {
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
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).send(`Error retrieving facility: ${error.message}`);
    }
});
//Get all facilities
app.get("/api/facilities", async (req, res) => {
    console.log("GET facilities");
    try {
        const snapshot = await db.collection("facilities").limit(100).get();
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
