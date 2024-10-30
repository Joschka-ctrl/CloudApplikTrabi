import {
  faDeleteLeft,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Image,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Stack,
} from "react-bootstrap";

export default function DefectDetail({
  show,
  defectId,
  onClose,
  editDefect,
  deleteDefect,
}) {
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
      console.log("Fetching Defect Detail");
  }, [API_URL, defectId, show]);

  const callEditDefect = () => {
    editDefect(defect);
  };

  return (
    <Modal show={show} size="xl" centered backdrop="static">
      <Modal.Header className="pb-0" closeButton onHide={onClose}>
        <Stack direction="horizontal" style={{ width: "100%" }}>
          <h3 className="fw-bold">Defektdetails</h3>
          <Stack>
            <div className="ms-auto me-4">
              <Stack
                direction="horizontal"
                gap={3}
                style={{ width: "100%" }}
                className="text-muted"
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (window.confirm("Möchten Sie diesen Defekt löschen?")) {
                      console.log("Deleting Defect");
                      onClose();
                      deleteDefect(defectId);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} size={24} />
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    onClose();
                    setTimeout(callEditDefect, 50);
                  }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} size={24} />
                </div>
              </Stack>
              <p className="text-muted small mb-0 align-self-end">
                ID: {defectId}
              </p>
            </div>
          </Stack>
        </Stack>
      </Modal.Header>
      <ModalBody>
        <Container>
          <Row></Row>
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
                style={{
                  width: "80%",
                  overflow: "hidden",
                }}
              >
                <Image
                  fluid
                  src={`${API_URL}/image/${defect.imageUrl}`}
                  style={{
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </ModalBody>
    </Modal>
  );
}
