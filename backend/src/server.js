const express = require("express");
const cors = require("cors");
const app = express();
const port = 3015;
// Importiere die Firestore-Instanz
const db = require("./firestore.js");

app.use(express.json());
app.use(cors());

// **1. Defect erstellen**
app.post("/defects", async (req, res) => {
  try {
    const {
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
    } = req.body;

    // Validierung (identisch zu vorher)
    if (
      !object ||
      !location ||
      !shortDescription ||
      !detailDescription ||
      !reportingDate ||
      !status
    ) {
      return res.status(400).json({ error: "Alle Felder sind erforderlich." });
    }
    if (shortDescription.length > 80) {
      return res
        .status(400)
        .json({
          error: "Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.",
        });
    }

    // Firestore-Dokument erstellen
    const docRef = await db.collection('defects').add({
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
    });

    // ID des neuen Dokuments abrufen
    const newDefectId = docRef.id;

    res.status(201).json({
      id: newDefectId,
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **2. Alle Defects abrufen**
app.get("/defects", async (req, res) => {
  try {
    const { location, status } = req.query;

    let query = db.collection('defects');

    // Filter anwenden
    if (location && status) {
      query = query.where('location', '==', location).where('status', '==', status);
    } else if (location) {
      query = query.where('location', '==', location);
    } else if (status) {
      query = query.where('status', '==', status);
    }

    // Daten abrufen
    const snapshot = await query.get();
    const defects = [];
    snapshot.forEach((doc) => {
      defects.push({ id: doc.id, ...doc.data() });
    });

    res.json(defects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **3. Einzelnes Defect abrufen**
app.get("/defects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('defects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Defect nicht gefunden." });
    }

    res.json({ id: doc.id, ...doc.data() });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **4. Defect aktualisieren**
app.put("/defects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
    } = req.body;

    // Validierung (identisch zu vorher)
    if (
      !object ||
      !location ||
      !shortDescription ||
      !detailDescription ||
      !reportingDate ||
      !status
    ) {
      return res.status(400).json({ error: "Alle Felder sind erforderlich." });
    }
    if (shortDescription.length > 80) {
      return res
        .status(400)
        .json({
          error: "Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.",
        });
    }

    const docRef = db.collection('defects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Defect nicht gefunden." });
    }

    await docRef.update({
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
    });

    res.json({ message: "Defect aktualisiert." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **5. Defect löschen**
app.delete("/defects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('defects').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Defect nicht gefunden." });
    }

    await docRef.delete();

    res.json({ message: "Defect gelöscht." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});