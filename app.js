const express = require('express');
const app = express();
const port = 3000;

// Middleware zum Parsen von JSON-Anfragen
app.use(express.json());

// Basisroute
app.get('/', (req, res) => {
  res.send('Hallo Welt!');
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
