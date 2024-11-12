
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const admin = require('firebase-admin');
const app = express();
const port = 3015;
const db = require("./firestore.js"); // Firestore-Datenbank


// Configure Multer middleware
const upload = multer({
  storage: multer.memoryStorage(),
});

// Google Cloud Storage Konfiguration
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "trabantparking";
const storage = new Storage({ projectId });
const bucket_env = process.env.BUCKET_ENV || "";
const bucketName = `trabant_images${bucket_env}`;
console.log("Using bucket: " + bucketName);
const bucket = storage.bucket(bucketName);

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


// **1. Defect erstellen (geschützte Route)**
app.post("/defects", authenticateToken, async (req, res) => {
  try {
    const { object, location, shortDescription, detailDescription, reportingDate, status } = req.body;

    if (!object || !location || !shortDescription || !detailDescription || !reportingDate || !status) {
      return res.status(400).json({ error: "Alle Felder sind erforderlich." });
    }
    if (shortDescription.length > 80) {
      return res.status(400).json({
        error: "Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.",
      });
    }

    // Firestore-Dokument erstellen
    let updatedAt = new Date().toISOString();
    const docRef = await db.collection("defects").add({
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
      updatedAt,
    });
    const newDefectId = docRef.id;

    res.status(201).json({
      id: newDefectId, object, location, shortDescription, detailDescription, reportingDate, status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **2. Alle Defects abrufen**
app.get("/defects", authenticateToken, async (req, res) => {
  try {
    const { filterType, filterText } = req.query;
    const allowedFilterFields = ["object", "location", "shortDescription", "detailDescription", "reportingDate", "status"];
    let query = db.collection("defects");

    if (filterType && filterText && allowedFilterFields.includes(filterType)) {
      query = query.where(filterType, ">=", filterText).where(filterType, "<=", filterText + "\uf8ff");
    } else if (filterType && !allowedFilterFields.includes(filterType)) {
      return res.status(400).json({ error: "Invalid filter field." });
    }

    const snapshot = await query.get();
    const defects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(defects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **3. Einzelnes Defect abrufen**
app.get("/defects/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection("defects").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Defect nicht gefunden." });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **4. Defect aktualisieren**
app.put("/defects/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { object, location, shortDescription, detailDescription, reportingDate, status } = req.body;

    if (!object || !location || !shortDescription || !detailDescription || !reportingDate || !status) {
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

    let updatedAt = new Date().toISOString();

    await docRef.update({
      object,
      location,
      shortDescription,
      detailDescription,
      reportingDate,
      status,
      updatedAt,
    });

    res.json({ message: "Defect aktualisiert." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **5. Defect löschen**
app.delete("/defects/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection("defects").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Defect nicht gefunden." });

    await docRef.delete();
    res.json({ message: "Defect gelöscht." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **6. Bild hochladen**
app.post("/defects/:id/uploadPicture", authenticateToken, upload.single("picture"), async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection("defects").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Defect nicht gefunden." });
    if (!req.file) return res.status(400).json({ error: "Kein Bild hochgeladen." });

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileName = `defects/${id}/${Date.now()}_${originalName}`;

    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: { contentType: mimeType },
      resumable: false,
    });

    stream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Fehler beim Hochladen des Bildes." });
    });

    stream.on("finish", async () => {
      await docRef.update({ imageUrl: file.id });
      res.status(200).json({ message: "Bild hochgeladen.", imageUrl: file.id });
    });

    stream.end(fileBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **7. Bild abrufen**
app.get("/image/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const file = bucket.file(fileName);

  file
    .createReadStream()
    .on("error", (err) => {
      res.status(500).send("Error fetching image");
    })
    .on("response", (response) => {
      res.setHeader("Content-Type", response.headers["content-type"]);
    })
    .pipe(res);
});

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});
