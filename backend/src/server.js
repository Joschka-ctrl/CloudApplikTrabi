const express = require("express");
const app = express();
const port = 3015;
const db = require('./database'); 

app.use(express.json());


// **1. Defect erstellen**
app.post('/defects', (req, res) => {
  const { object, location, shortDescription, detailDescription, reportingDate, status } = req.body;

  // Validierung
  if (!object || !location || !shortDescription || !detailDescription || !reportingDate || !status) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }
  if (shortDescription.length > 80) {
      return res.status(400).json({ error: 'Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.' });
  }

  const sql = `INSERT INTO defects (object, location, shortDescription, detailDescription, reportingDate, status)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [object, location, shortDescription, detailDescription, reportingDate, status];

  db.run(sql, params, function(err) {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.status(201).json({
              id: this.lastID,
              object,
              location,
              shortDescription,
              detailDescription,
              reportingDate,
              status
          });
      }
  });
});

// **2. Alle Defects abrufen**
app.get('/defects', (req, res) => {
  const { location, status } = req.query;
  let sql = 'SELECT * FROM defects';
  let params = [];

  if (location && status) {
      sql += ' WHERE location LIKE ? AND status = ?';
      params.push(`%${location}%`, status);
  } else if (location) {
      sql += ' WHERE location LIKE ?';
      params.push(`%${location}%`);
  } else if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
  }

  db.all(sql, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });
});

// **3. Einzelnes Defect abrufen**
app.get('/defects/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM defects WHERE id = ?';
  const params = [id];

  db.get(sql, params, (err, row) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else if (row) {
          res.json(row);
      } else {
          res.status(404).json({ error: 'Defect nicht gefunden.' });
      }
  });
});

// **4. Defect aktualisieren**
app.put('/defects/:id', (req, res) => {
  const id = req.params.id;
  const { object, location, shortDescription, detailDescription, reportingDate, status } = req.body;

  // Validierung
  if (!object || !location || !shortDescription || !detailDescription || !reportingDate || !status) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }
  if (shortDescription.length > 80) {
      return res.status(400).json({ error: 'Die Kurzbeschreibung darf maximal 80 Zeichen lang sein.' });
  }

  const sql = `UPDATE defects SET
               object = ?, location = ?, shortDescription = ?, detailDescription = ?, reportingDate = ?, status = ?
               WHERE id = ?`;
  const params = [object, location, shortDescription, detailDescription, reportingDate, status, id];

  db.run(sql, params, function(err) {
      if (err) {
          res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
          res.status(404).json({ error: 'Defect nicht gefunden.' });
      } else {
          res.json({ message: 'Defect aktualisiert.' });
      }
  });
});

// **5. Defect löschen**
app.delete('/defects/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM defects WHERE id = ?';
  const params = [id];

  db.run(sql, params, function(err) {
      if (err) {
          res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
          res.status(404).json({ error: 'Defect nicht gefunden.' });
      } else {
          res.json({ message: 'Defect gelöscht.' });
      }
  });
}); 

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});
