import React from "react";
import { Button, Table, Stack, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function DefectTable({
  filteredDefects,
  editDefect,
  deleteDefect,
  refreshData,
  toggleForm,
  editingDefectId,
  newStatus,
  setNewStatus,
  updateDefectStatus,
  showDefectDetail,
  defectDetailId,
}) {
  const renderTooltipAddDefect = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Add Defect
    </Tooltip>
  );

  const renderToolTipRefresh = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Refresh
    </Tooltip>
  );

  const openDefect = (id) => {
    showDefectDetail(true);
    defectDetailId(id);
  };

  return (
    <div>
      <Table striped bordered hover size="sm" variant="light">
        <thead>
          <tr>
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderToolTipRefresh}
              >
                <Button
                  className="me-3"
                  variant="outline-primary"
                  onClick={refreshData}
                >
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltipAddDefect}
              >
                <Button variant="outline-primary" onClick={toggleForm}>
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </OverlayTrigger>
            </th>
          </tr>
          <tr>
            <th>Object</th>
            <th>Location</th>
            <th>Short Description</th>
            <th>Reporting Date</th>
            <th>Status</th>
            <th className="text-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDefects.map((defect) => (
            <tr key={defect.id}>
              <td>{defect.object}</td>
              <td>{defect.location}</td>
              <td>{defect.shortDescription}</td>
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
                  <span className={`status ${defect.status.toLowerCase()}`}>
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
                      onClick={() => setNewStatus(null)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      variant="outline-info"
                      onClick={() => {
                        openDefect(defect.id);
                      }}
                    >
                      Open
                    </Button>
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
