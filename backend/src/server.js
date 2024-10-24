const multer = require("multer"); // For handling file uploads
const { Storage } = require("@google-cloud/storage");

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3015;
// Importiere die Firestore-Instanz
const db = require("./firestore.js");
// Configure Multer middleware
const upload = multer({
  storage: multer.memoryStorage(),
});

// Initialize Google Cloud Storage client
const storage = new Storage({
  // Optional: specify credentials or project ID if not using default settings
  projectId: "trabantparking",
});
const bucketName = "trabant_images"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

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
      return res.status(400).json({
        error: "Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.",
      });
    }

    // Firestore-Dokument erstellen
    const docRef = await db.collection("defects").add({
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
    const { filterType, filterText } = req.query;
    const allowedFilterFields = [
      'object',
      'location',
      'shortDescription',
      'detailDescription',
      'reportingDate',
      'status',
    ];

    let query = db.collection("defects");

    if (filterType && filterText) {
      if (allowedFilterFields.includes(filterType)) {
        query = query.where(filterType, '>=', filterText).where(filterType, '<=', filterText + '\uf8ff');
      } else {
        return res.status(400).json({ error: 'Invalid filter field.' });
      }
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
    const docRef = db.collection("defects").doc(id);
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
      return res.status(400).json({
        error: "Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.",
      });
    }

    const docRef = db.collection("defects").doc(id);
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
    const docRef = db.collection("defects").doc(id);
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

// **6. Bild hochladen**
app.post(
  "/defects/:id/uploadPicture",
  upload.single("picture"),
  async (req, res) => {
    try {
      const id = req.params.id;

      // Prüfen, ob das Defect existiert
      const docRef = db.collection("defects").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Defect nicht gefunden." });
      }

      // Prüfen, ob eine Datei hochgeladen wurde
      if (!req.file) {
        return res.status(400).json({ error: "Kein Bild hochgeladen." });
      }

      // Dateipuffer und -informationen abrufen
      const fileBuffer = req.file.buffer;
      const originalName = req.file.originalname;
      const mimeType = req.file.mimetype;

      // Eindeutigen Dateinamen erstellen
      const fileName = `defects/${id}/${Date.now()}_${originalName}`;

      // Datei zu Google Cloud Storage hochladen
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
        },
        resumable: false,
      });

      stream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Hochladen des Bildes." });
      });

      stream.on("finish", async () => {
        // Datei öffentlich lesbar machen
        await file.makePublic();

        // Öffentliche URL der Datei abrufen
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        // Defect-Dokument mit der Bild-URL aktualisieren
        await docRef.update({
          imageUrl: publicUrl,
        });

        res
          .status(200)
          .json({ message: "Bild hochgeladen.", imageUrl: publicUrl });
      });

      stream.end(fileBuffer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});
