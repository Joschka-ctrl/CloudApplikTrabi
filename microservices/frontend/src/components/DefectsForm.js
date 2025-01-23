import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import { useAuth } from "./AuthProvider";
import { useFetcher } from "react-router-dom";

export default function DefectForm({ show, onClose }) {
  const { user, currentTenantId } = useAuth(); // Use the user object from AuthProvider
  const [facilities, setFacilities] = React.useState([]);
  const [facilityNames, setFacilityNames] = React.useState([]);

  const [newFacilityId, setNewFacilityId] = useState("");
  const [object, setObject] = useState("");
  const [location, setLocation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [reportingDate, setReportingDate] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [defectId, setDefectId] = useState(null);

  const FACILITY_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3021"
      : "";

  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3015"
      : process.env.REACT_APP_API_URL;

  const fetchWithAuth = async (url, options = {}) => {
    if (user) {
      const token = await user.getIdToken(); // Fetch the token from the user object
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    } else {
      throw new Error("User is not authenticated");
    }
  };

  React.useEffect(() => {
    console.log("current tenant id", currentTenantId);
    fetch(`${FACILITY_API_URL}/api/facilities/${currentTenantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFacilities(data);
        try {
          setFacilityNames(data.map((facility) => facility.name));
        } catch (error) {
          setFacilityNames([]);
        }
      })
      .catch((error) => console.error("Error fetching facilities:", error));
  }, []);

  const setFacilityID = (facilityName) => {
    if (facilities.length > 0) {
      const facility = facilities.find(
        (facility) => facility.name === facilityName
      );
      if (facility) {
        console.log(facility)
        setNewFacilityId(facility.facilityId);
      }
    }
  };

  const getFacilityName = (facilityID) => {
    if (facilities.length > 0) {
      const facility = facilities.find(
        (facility) => facility.id === facilityID
      );
      if (facility) {
        return facility.name;
      }
    }
  };

  //POST new Defect
  const createDefect = async () => {
    const defectData = {
      object: object,
      location: location,
      shortDescription: shortDescription,
      detailDescription: detailDescription,
      reportingDate: reportingDate,
      status: status,
      facilityID: newFacilityId,
      tenantID: currentTenantId,
    };
    try {
      let newDefectId = null;
      console.log("Creating defect for:", currentTenantId, defectData);
      fetchWithAuth(`${API_URL}/defects/${currentTenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defectData),
      })
        .then((response) => response.json())
        .then((data) => {
          newDefectId = data.id;
          setDefectId(newDefectId);
          console.log("New defect created with ID:", newDefectId);

          if (file) {
            const formData = new FormData();
            formData.append("picture", file);
            console.log(formData)

            fetchWithAuth(
              `${API_URL}/defects/${currentTenantId}/${newFacilityId}/${data.id}/uploadPicture`,
              {
                method: "POST",
                body: formData,
              }
            ).then((response) => {
              if (response.ok) {
                console.log("File uploaded successfully");
                onClose();
              }
              if (!response.ok) {
                console.error("Error uploading file");
              }
            });
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const formSubmit = (e) => {
    e.preventDefault();
    createDefect();
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Form onSubmit={formSubmit}>
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title id="contained-modal-title-vcenter">
            {defectId ? "Edit Defect" : "Create New Defect"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form.Label>
                Facility:
                <Form.Select
                  name="facilityID"
                  value={getFacilityName(newFacilityId)}
                  onChange={(e) => setFacilityID(e.target.value)}
                  required
                >
                  <option key={"default"} value={""}>
                    {" "}
                    Select A facility{" "}
                  </option>
                  {facilityNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Label>

              <Form.Label>
                Object:
                <Form.Control
                  type="text"
                  name="object"
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
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
                  value={detailDescription}
                  onChange={(e) => setDetailDescription(e.target.value)}
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
                  value={reportingDate}
                  onChange={(e) => setReportingDate(e.target.value)}
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
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  onChange={(e) => setFile(e.target.files[0])} // Handle file input change
                  required
                />
              </Form.Label>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="success">
            {defectId ? "Update Defect" : "Create Defect"}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
