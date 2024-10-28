import React from "react";
import { Button, Table, Stack, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

export default function DefectTable({
  filteredDefects,
  refreshData,
  toggleForm,
  editingDefectId,
  newStatus,
  setNewStatus,
  updateDefectStatus,
  showDefectDetail,
  defectDetailId,
  toggleDetailPage,
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
      <Table striped bordered hover size="sm" variant="light" style={{cursor: "pointer"}}>
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
          </tr>
        </thead>
        <tbody>
          {filteredDefects.map((defect) => (
            <tr key={defect.id} onClick={() => toggleDetailPage(defect)}>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
