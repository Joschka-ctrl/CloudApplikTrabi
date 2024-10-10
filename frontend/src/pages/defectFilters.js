// src/defectFilters.js

import React, { useEffect, useState } from 'react';

const DefectFilter = ({ onFilterChange }) => {
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('object');

  // Funktion zur Handhabung der Eingabeänderung
  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilterText(text);
  };

  // Aufgerufen bei Text oder Type Änderung
  useEffect(() => {
    onFilterChange(filterText,filterType);
  },[filterText,filterType])

  return (
    <div>
      <select onChange={(e) => {setFilterType(e.target.value)}}>
        <option value="object">Object</option>
        <option value="location">Location</option>
        <option value="shortDescription">Short Description</option>
        <option value="detailDescription">Detail Description</option>
        <option value="reportingDate">Reporting Date</option>
        <option value="status">Status</option>
      </select>
      <input
        type="text"
        placeholder="Nach Objekt filtern..."
        value={filterText}
        onChange={handleFilterChange}
      />
    </div>
  );
};

export default DefectFilter;
