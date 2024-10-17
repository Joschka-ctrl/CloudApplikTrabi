import React, { useEffect, useState } from "react";
//import "../Defects.css";
import DefectFilter from './defectFilters.js';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { Stack } from "react-bootstrap";

export default function Defects() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState(''); // Status für den Filtertext
  const [filterType, setFilterType] = useState('');
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

  const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3015" // Lokale Backend-URL
    : process.env.REACT_APP_API_URL; // Produktions-Backend-URL


  useEffect(() => {
    fetch(API_URL + "/defects")
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
    fetch(API_URL + "/defects", {
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

    fetch(`${API_URL}/defects/${defectId}`, {
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
      fetch(`${API_URL}/defects/${id}`, {
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
    fetch(API_URL + "/defects")
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
  const handleFilterChange = (text,type) => {
    setFilterType(type);
    setFilterText(text); // Aktualisiere den Filtertext
  };

  // Defekte filtern basierend auf dem Filtertext
  const filteredDefects = data.filter(defect =>
    defect[filterType || 'object'].toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="defects-container">
      <h1>Defects</h1>
      
        <Modal
        show={showForm}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Form onSubmit={createDefect} className="">
        <Modal.Header closeButton onClick={() => setShowForm(false)}>
        <Modal.Title id="contained-modal-title-vcenter">
          Create New Defect
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
          <Col>
            <Form.Label >
            Object:
            <Form.Control
              type="text"
              name="object"
              value={newDefect.object}
              onChange={handleInputChange}
              required
            />
            </Form.Label>
          </Col>
          <Col>
          <Form.Label>
            Location:
            <Form.Control
              type="text"
              name="location"
              value={newDefect.location}
              onChange={handleInputChange}
              required
            />
          </Form.Label>
          </Col>
          </Row>
          <Row>
          <Col>
          <Form.Label>
            Short Description:
            <Form.Control
              type="text"
              name="shortDescription"
              value={newDefect.shortDescription}
              onChange={handleInputChange}
              maxLength="80"
              required
            />
          </Form.Label>
          </Col>
          <Col>
          <Form.Label>
            Detail Description:
            <Form.Control 
              as="textarea" 
              rows={3}
              name="detailDescription"
              value={newDefect.detailDescription}
              onChange={handleInputChange}
              maxLength="1000"
              required
            ></Form.Control>
          </Form.Label>

          </Col>
          </Row>
          <Row>
          <Col>
          <Form.Label>
            Reporting Date:
            <Form.Control
              type="date"
              name="reportingDate"
              value={newDefect.reportingDate}
              onChange={handleInputChange}
              required
            />
          </Form.Label>
          </Col>
          </Row>
          <Row>
          <Col>
          <Form.Label>
            Status:
            <Form.Select
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
            </Form.Select>
          </Form.Label>
          </Col>
          </Row>
          <Button type="submit" variant="success">
            Create Defect
          </Button>
        </Modal.Body>
        <Modal.Footer>
        <Button onClick={() => setShowForm(false)}>Close</Button>
        </Modal.Footer>
        </Form>
      </Modal>


   
    <DefectFilter onFilterChange={handleFilterChange} />


    <Table striped bordered hover size="sm" variant="light">
      <thead>
        <tr>
          <th className="text-center">
      <Button 
        className="me-3"
        variant="outline-primary"  
        onClick={refreshData}>
          <FontAwesomeIcon icon={faArrowsRotate} />
      </Button>
         
          <Button variant="outline-primary" onClick={() => setShowForm(!showForm)}>
        <FontAwesomeIcon icon={faPlus} />
      </Button>
          </th>
        </tr>
        <tr>
          <th>Object</th>
          <th>Location</th>
          <th>Short Description</th>
          <th>Detail Description</th>
          <th>Reporting Date</th>
          <th>Status</th>
          <th>Actions</th> 
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
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      variant="outline-success"
                      onClick={() => updateDefectStatus(defect.id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setEditingDefectId(null)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      variant="outline-primary"
                      onClick={() => editDefect(defect)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => deleteDefect(defect.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
