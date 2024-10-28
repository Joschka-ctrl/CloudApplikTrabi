import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function DefectDetail({ defect, show, onClose, updateDefect, deleteDefect }) {
  const [editedDefect, setEditedDefect] = useState(defect || {});

  useEffect(() => {
    setEditedDefect(defect || {});
  }, [defect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDefect({ ...editedDefect, [name]: value });
  };

  const handleSave = () => {
    updateDefect(editedDefect);
  };

  if (!defect) {
    return null; // Oder zeigen Sie einen Ladeindikator an
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Defekt Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formObject">
            <Form.Label>Objekt</Form.Label>
            <Form.Control
              type="text"
              name="object"
              value={editedDefect.object || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formLocation">
            <Form.Label>Standort</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={editedDefect.location || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formShortDescription">
            <Form.Label>Kurzbeschreibung</Form.Label>
            <Form.Control
              type="text"
              name="shortDescription"
              value={editedDefect.shortDescription || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formDetailDescription">
            <Form.Label>Detailbeschreibung</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="detailDescription"
              value={editedDefect.detailDescription || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formReportingDate">
            <Form.Label>Meldedatum</Form.Label>
            <Form.Control
              type="date"
              name="reportingDate"
              value={editedDefect.reportingDate || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={editedDefect.status || ''}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="in work">In Work</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formImage">
            <Form.Label>Bild</Form.Label>
            <br/>
            {editedDefect.imageUrl && (
              <img
                src={editedDefect.imageUrl}
                alt="Defect Image"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            ) ||
            <div style={{ width: '100%', height: '200px', backgroundColor: '#e9ecef' }}>
              Bild wird hier angezeigt
            </div>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => deleteDefect(defect.id)}>
          Löschen
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Speichern
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
