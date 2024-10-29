import React from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';

export default function DefectForm({ show, onClose, onSubmit, defect, handleInputChange, handleFileChange }) {
  return (
    <Modal show={show} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title id="contained-modal-title-vcenter">
            {defect.id ? 'Edit Defect' : 'Create New Defect'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form.Label>
                Object:
                <Form.Control
                  type="text"
                  name="object"
                  value={defect.object}
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
                  value={defect.location}
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
                  value={defect.shortDescription}
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
                  value={defect.detailDescription}
                  onChange={handleInputChange}
                  maxLength="1000"
                  required
                />
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
                  value={defect.reportingDate}
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
                  value={defect.status}
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
          <Row>
            <Col>
              <Form.Label>
                Upload File:
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handleFileChange} // Handle file input change
                  required
                />
              </Form.Label>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="success">
            {defect.id ? 'Update Defect' : 'Create Defect'}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
