// database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Erstelle und öffne die Datenbank (erstellt sie, wenn sie nicht existiert)
const dbPath = path.join(__dirname, 'example.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('Datenbank verbunden.');
    }
});

// Tabelle erstellen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS defects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object TEXT NOT NULL,
        location TEXT NOT NULL,
        shortDescription TEXT NOT NULL CHECK(length(shortDescription) <= 80),
        detailDescription TEXT NOT NULL CHECK(length(detailDescription) <= 1000),
        reportingDate TEXT NOT NULL,
        status TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Fehler beim Erstellen der Tabelle:', err.message);
        } else {
            console.log('Tabelle "defects" erstellt oder existiert bereits.');
        }
    });
});

module.exports = db;
