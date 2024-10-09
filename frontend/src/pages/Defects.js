import React, { useEffect, useState } from "react";
import "../Defects.css";

export default function Defects() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3015/defects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Netzwerkantwort war nicht ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der Daten:", error);
      });
  }, []);

  // Funktion zum Löschen eines Defekts
  const deleteDefect = (id) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Defekt löschen möchten?")) {
      fetch(`http://localhost:3015/defects/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fehler beim Löschen des Defekts");
          }
          // Aktualisiere die lokale Daten, indem der gelöschte Defekt entfernt wird
          setData(data.filter((defect) => defect.id !== id));
        })
        .catch((error) => {
          console.error("Fehler beim Löschen des Defekts:", error);
        });
    }
  };

  // Funktion zum Bearbeiten eines Defekts
  const editDefect = (defect) => {
    // Hier könnten Sie ein Modal öffnen oder zu einer anderen Seite navigieren
    // Für dieses Beispiel verwenden wir prompt() zur einfachen Eingabe

    const newStatus = prompt("Neuen Status eingeben:", defect.status);
    if (newStatus && newStatus !== defect.status) {
      // Erstellen Sie ein aktualisiertes Defektobjekt
      const updatedDefect = { ...defect, status: newStatus };

      fetch(`http://localhost:3015/defects/${defect.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDefect),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fehler beim Aktualisieren des Defekts");
          }
          return response.json();
        })
        .then((data) => {
          // Aktualisiere den Defekt in der lokalen Daten
          setData((prevData) =>
            prevData.map((d) => (d.id === data.id ? data : d))
          );
        })
        .catch((error) => {
          console.error("Fehler beim Aktualisieren des Defekts:", error);
        });
    }
  };

  return (
    <div className="defects-container">
      <h1>Defects</h1>
      <table className="defects-table">
        <thead>
          <tr>
            <th>Object</th>
            <th>Location</th>
            <th>Short Description</th>
            <th>Detail Description</th>
            <th>Reporting Date</th>
            <th>Status</th>
            <th>Actions</th> {/* Neue Spalte für Aktionen */}
          </tr>
        </thead>
        <tbody>
          {data.map((defect) => (
            <tr key={defect.id}>
              <td>{defect.object}</td>
              <td>{defect.location}</td>
              <td>{defect.shortDescription}</td>
              <td>{defect.detailDescription}</td>
              <td>{defect.reportingDate}</td>
              <td className={`status ${defect.status.toLowerCase()}`}>
                {defect.status}
              </td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => editDefect(defect)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteDefect(defect.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
