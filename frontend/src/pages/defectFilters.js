import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const DefectFilter = ({ onFilterChange }) => {
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('object');

  // Debounce-Timer für verzögertes Filtern
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Funktion zur Handhabung der Eingabeänderung mit Debouncing
  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilterText(text);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Verzögere die Filteraktualisierung um 300ms
    const timeout = setTimeout(() => {
      onFilterChange(text, filterType);
    }, 300);

    setDebounceTimeout(timeout);
  };

  // Setzt den Filter zurück
  const handleReset = () => {
    setFilterText('');
    onFilterChange('', filterType);
  };

  return (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 m-5">
      <Form.Select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        aria-label="Filter by type"
        className="mb-2 mb-md-0"
      >
        <option value="object">Object</option>
        <option value="location">Location</option>
        <option value="shortDescription">Short Description</option>
        <option value="detailDescription">Detail Description</option>
        <option value="reportingDate">Reporting Date</option>
        <option value="status">Status</option>
      </Form.Select>

      <InputGroup>
        <Form.Control
          type="text"
          placeholder={`Filter by ${filterType}...`}
          value={filterText}
          onChange={handleFilterChange}
          aria-label={`Filter by ${filterType}`}
        />
        <Button variant="outline-secondary" onClick={handleReset}>
          Reset
        </Button>
      </InputGroup>
    </div>
  );
};

export default DefectFilter;
