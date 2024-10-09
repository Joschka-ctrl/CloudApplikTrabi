import React, { useEffect, useState } from "react";
import "../Defects.css";
import DefectFilter from './defectFilters.js';

export default function Defects() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState(''); // Status für den Filtertext
  const [showForm, setShowForm] = useState(false);
  const [editingDefectId, setEditingDefectId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newDefect, setNewDefect] = useState({
    object: "",
    location: "",
    shortDescription: "",
    detailDescription: "",
    reportingDate: "",
    status: "",
  });

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

  // Funktion zum Erstellen eines neuen Defekts
  const createDefect = (e) => {
    e.preventDefault();
    fetch("http://localhost:3015/defects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDefect),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fehler beim Erstellen des Defekts");
        }
        return response.json();
      })
      .then((data) => {
        // Füge den neuen Defekt zur lokalen Daten hinzu
        setData((prevData) => [...prevData, data]);
        // Formular zurücksetzen und ausblenden
        setNewDefect({
          object: "",
          location: "",
          shortDescription: "",
          detailDescription: "",
          reportingDate: "",
          status: "",
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Fehler beim Erstellen des Defekts:", error);
      });
  };

  // Funktion zum Aktualisieren der Eingabefelder
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDefect({ ...newDefect, [name]: value });
  };

  // Funktion zum Aktualisieren des Defektstatus
  const updateDefectStatus = (defectId) => {
    const defect = data.find((d) => d.id === defectId);
    if (!defect) return;

    const updatedDefect = { ...defect, status: newStatus };

    fetch(`http://localhost:3015/defects/${defectId}`, {
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
        setData((prevData) =>
          prevData.map((d) => (d.id === data.id ? data : d))
        );
        // Bearbeitungsmodus verlassen
        setEditingDefectId(null);
        setNewStatus("");
        refreshData();
      })
      .catch((error) => {
        console.error("Fehler beim Aktualisieren des Defekts:", error);
      });
  };

  const deleteDefect = (id) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Defekt löschen möchten?")) {
      fetch(`http://localhost:3015/defects/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fehler beim Löschen des Defekts");
          }
          setData(data.filter((defect) => defect.id !== id));
        })
        .catch((error) => {
          console.error("Fehler beim Löschen des Defekts:", error);
        });
    }
  };

  const refreshData = () => {
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
  };

  const editDefect = (defect) => {
    setEditingDefectId(defect.id);
    setNewStatus(defect.status);
  };

  // Funktion zum Festlegen des Filtertextes
  const handleFilterChange = (text) => {
    setFilterText(text); // Aktualisiere den Filtertext
  };

  // Defekte filtern basierend auf dem Filtertext
  const filteredDefects = data.filter(defect =>
    defect.object.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="defects-container">
      <h1>Defects</h1>
      <div className="buttons-top">
      <button className="refresh-button" onClick={refreshData}>Refresh</button>
      <button className="create-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close Form" : "Create Defect"}
      </button>
      </div>
      {showForm && (
        <form className="defect-form" onSubmit={createDefect}>
          <h2>Create New Defect</h2>
          <label>
            Object:
            <input
              type="text"
              name="object"
              value={newDefect.object}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={newDefect.location}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Short Description:
            <input
              type="text"
              name="shortDescription"
              value={newDefect.shortDescription}
              onChange={handleInputChange}
              maxLength="80"
              required
            />
          </label>
          <label>
            Detail Description:
            <textarea
              name="detailDescription"
              value={newDefect.detailDescription}
              onChange={handleInputChange}
              maxLength="1000"
              required
            ></textarea>
          </label>
          <label>
            Reporting Date:
            <input
              type="date"
              name="reportingDate"
              value={newDefect.reportingDate}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Status:
            <select
              name="status"
              value={newDefect.status}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Status</option>
              <option value="open">Open</option>
              <option value="in work">In Work</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <button type="submit" className="submit-button">
            Create Defect
          </button>
        </form>
      )}


   
    <DefectFilter onFilterChange={handleFilterChange} />


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
      {filteredDefects.map((defect) => (
            <tr key={defect.id}>
              <td>{defect.object}</td>
              <td>{defect.location}</td>
              <td>{defect.shortDescription}</td>
              <td>{defect.detailDescription}</td>
              <td>{defect.reportingDate}</td>
              <td>
                {editingDefectId === defect.id ? (
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in work">In Work</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <span
                    className={`status ${defect.status.toLowerCase()}`}
                  >
                    {defect.status}
                  </span>
                )}
              </td>
              <td>
                {editingDefectId === defect.id ? (
                  <>
                    <button
                      className="save-button"
                      onClick={() => updateDefectStatus(defect.id)}
                    >
                      Save
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => setEditingDefectId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
