import express from "express";
import admin from "firebase-admin";
import cors from 'cors';
import { Facility } from "./înterface/facility";

const app = express();
app.use(cors())
app.use(express.json());
const port = 3021;

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

admin.firestore().settings({
  databaseId: "facilities",
});

const db = admin.firestore();

// Routes

app.post("/api/facilities", async (req, res) => {
  console.log("POST /facility");
  try {
    const body = req.body;
      if (!body || typeof body !== "object") {
        res.status(400).send("Invalid request body");
        return
      }

      // Validate required fields based on Facility interface
      if (!body.name || typeof body.name !== "string") {
        res.status(400).send("Invalid facility data: name is required");
        return
      }

      console.log('Saving Facility');
      
      const data: Facility = body;
      db.collection("facilities")
        .add(data)
        .then((docRef) => {
          res.status(201).send(`Facility added with ID: ${docRef.id}`);
        });
      
      console.log('Facility saved');
    } catch (error) {
      res.status(500).send(`Error adding facility: ${(error as Error).message}`);
    }
})

//Update facility
app.put("/api/facilities/:id", async (req, res) => {
  console.log("PUT facility");
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("Invalid facility ID");
      return
    }

    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).send("Invalid request body");
      return
    }

    // Validate required fields based on Facility interface
    if (!body.name || typeof body.name !== "string") {
      res.status(400).send("Invalid facility data: name is required");
      return
    }

    const data: Facility = body;
    await db.collection("facilities").doc(id).set(data, { merge: true });
    res.status(200).send(`Facility updated with ID: ${id}`);
  } catch (error) {
    res.status(500).send(`Error updating facility: ${(error as Error).message}`);
  }
})

//Get facility
app.get("/api/facilities/:id", async (req, res) => {
  console.log("GET facility");
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("Invalid facility ID");
      return
    }

    const doc = await db.collection("facilities").doc(id).get();
    if (!doc.exists) {
      res.status(404).send("Facility not found");
      return
    }

    const data = doc.data();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error retrieving facility: ${(error as Error).message}`);
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
  } catch (error) {
    res.status(500).send(`Error retrieving facilities: ${(error as Error).message}`);
  }
})


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
