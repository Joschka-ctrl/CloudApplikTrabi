const express = require("express");
const app = express();
const port = 3015;

app.use(express.json());

let defects = [
  {
    id: 1,
    object: "Parkhaus am Stadtgraben",
    location: "Entry to staircases in 2nd level",
    shortDescription: "Door does not close properly",
    detailDescription: "When closing the door, sometimes it doesn't latch properly.",
    reportingDate: "2024-10-08",
    status: "open",
  },
  // Weitere Dummy-Daten
];

// Alle Defects abrufen (mit optionalen Filtern)
app.get('/defects', (req, res) => {
  let filteredDefects = defects;
  const { location, status } = req.query;

  if (location) {
    filteredDefects = filteredDefects.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (status) {
    filteredDefects = filteredDefects.filter(d => d.status.toLowerCase() === status.toLowerCase());
  }
  res.json(filteredDefects);
});

// Einzelnes Defect abrufen
app.get('/defects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const defect = defects.find(d => d.id === id);
  if (defect) {
    res.json(defect);
  } else {
    res.status(404).json({ message: 'Defect nicht gefunden' });
  }
});

// Neues Defect erstellen
app.post('/defects', (req, res) => {
  const newDefect = {
    id: defects.length + 1,
    object: req.body.object,
    location: req.body.location,
    shortDescription: req.body.shortDescription,
    detailDescription: req.body.detailDescription,
    reportingDate: req.body.reportingDate,
    status: req.body.status,
  };
  defects.push(newDefect);
  res.status(201).json(newDefect);
});

// Defect aktualisieren
app.put('/defects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = defects.findIndex(d => d.id === id);
  if (index !== -1) {
    defects[index] = {
      id: id,
      object: req.body.object,
      location: req.body.location,
      shortDescription: req.body.shortDescription,
      detailDescription: req.body.detailDescription,
      reportingDate: req.body.reportingDate,
      status: req.body.status,
    };
    res.json(defects[index]);
  } else {
    res.status(404).json({ message: 'Defect nicht gefunden' });
  }
});

// Defect löschen
app.delete('/defects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = defects.findIndex(d => d.id === id);
  if (index !== -1) {
    defects.splice(index, 1);
    res.json({ message: 'Defect gelöscht' });
  } else {
    res.status(404).json({ message: 'Defect nicht gefunden' });
  }
});
  

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});
