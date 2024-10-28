import { useEffect, useState } from "react";
import {
  Col,
  Container,
  Image,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Stack,
} from "react-bootstrap";

export default function DefectDetail({ show, defectId, onClose }) {
  const [defect, setDefect] = useState({ id: "undefined" });

  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3015"
      : process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(API_URL + "/defects/" + defectId)
      .then((response) => response.json())
      .then(setDefect)
      .catch(console.error);
  }, [API_URL, defectId]);

  return (
    <Modal show={show} size="xl" centered>
      <ModalHeader className="pb-0" closeButton onClick={onClose}>
        <Stack direction="horizontal" style={{ width: "100%" }}>
          <h3 className="fw-bold">Defektdetails</h3>
          <p className="ms-auto me-4 text-muted small mb-0 align-self-end">
            ID: {defectId}
          </p>
        </Stack>
      </ModalHeader>
      <ModalBody>
        <Container>
          <Row className="my-4">
            <Col lg={6} md={12} className="d-flex flex-column gap-3">
              <h5 className="fw-bold text-secondary">
                Objekt <br />
                <span className="fw-normal text-dark">
                  {defect.object || "N/A"}
                </span>
              </h5>
              <hr />
              <h5 className="fw-bold text-secondary">
                Ort <br />
                <span className="fw-normal text-dark">
                  {defect.location || "N/A"}
                </span>
              </h5>
              <hr />
              <h5 className="fw-bold text-secondary">
                Kurzbeschreibung <br />
                <span className="fw-normal text-dark">
                  {defect.shortDescription || "N/A"}
                </span>
              </h5>
              <hr />
              <div>
                <h5 className="fw-bold text-secondary mb-0 pb-0">
                  Beschreibung
                </h5>
                <p>
                  {defect.detailDescription || "Keine Beschreibung vorhanden"}
                </p>
              </div>
            </Col>

            <Col
              lg={6}
              className="d-flex justify-content-center align-items-start"
            >
              <div
                style={{ width: "256px", height: "256px", overflow: "hidden" }}
              >
                <Image
                  fluid
                  src={`${API_URL}/image/${defect.imageUrl}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </ModalBody>
    </Modal>
  );
}
