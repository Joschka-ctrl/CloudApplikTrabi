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
    // Erstelle die Tabelle, wenn sie nicht existiert
    db.run(`CREATE TABLE IF NOT EXISTS defects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object TEXT NOT NULL,
        location TEXT NOT NULL,
        shortDescription TEXT NOT NULL,
        detailDescription TEXT NOT NULL,
        reportingDate TEXT NOT NULL,
        status TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Fehler beim Erstellen der Tabelle:', err.message);
        } else {
            console.log('Tabelle "defects" erstellt oder existiert bereits.');
        }
    });
    
     // Beispiel: Einfügen eines neuen Defekts mit Zeichenbeschränkungen
     const insertDefect = (object, location, shortDescription, detailDescription, reportingDate, status) => {
        // Validierung der Zeichenlängen
        if (shortDescription.length > 80) {
            return console.error('Fehler: shortDescription darf maximal 80 Zeichen lang sein.');
        }
        if (detailDescription.length > 1000) {
            return console.error('Fehler: detailDescription darf maximal 1000 Zeichen lang sein.');
        }

        const insertStmt = db.prepare(`INSERT INTO defects (object, location, shortDescription, detailDescription, reportingDate, status) VALUES (?, ?, ?, ?, ?, ?)`);
        insertStmt.run(object, location, shortDescription, detailDescription, reportingDate, status, (err) => {
            if (err) {
                console.error('Fehler beim Einfügen des Defekts:', err.message);
            } else {
                console.log('Defekt erfolgreich hinzugefügt:', { object, location, shortDescription, detailDescription, reportingDate, status });
            }
        });
        insertStmt.finalize();
    };

    // Beispiel: Einfügen eines neuen Defekts
    insertDefect('Leck in der Wand', 'Wohnzimmer', 'Wasserleck', 'Es gibt ein Wasserleck in der Wand.', '2024-10-09', 'OPEN');
    insertDefect('Kaputter Aufzug', 'Eingang', 'Der Aufzug funktioniert nicht.', 'Der Aufzug bleibt in der dritten Etage stecken.', '2024-10-09', 'OPEN');
});

// Schließe die Datenbankverbindung
db.close((err) => {
    if (err) {
        console.error('Fehler beim Schließen der Datenbank:', err.message);
    } else {
        console.log('Datenbank geschlossen.');
    }
});