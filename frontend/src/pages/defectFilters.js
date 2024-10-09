// src/defectFilters.js

import React, { useState } from 'react';

const DefectFilter = ({ onFilterChange }) => {
  const [filterText, setFilterText] = useState('');

  // Funktion zur Handhabung der Eingabeänderung
  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilterText(text);
    onFilterChange(text); // Leitet den Filtertext an die Hauptkomponente weiter
  };

  return (
    <div>
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
