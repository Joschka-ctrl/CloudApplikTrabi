import React, { useEffect, useState } from "react";
import DefectTable from "../components/DefectsTable.js";
import DefectForm from "../components/DefectsForm.js";
import DefectFilter from './defectFilters.js';

export default function Defects() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDefectId, setEditingDefectId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newDefect, setNewDefect] = useState({
    object: "",
    location: "",
    shortDescription: "",
    detailDescription: "",
    reportingDate: "",
    status: "",
  });

  const API_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3015"
    : process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(API_URL + "/defects")
      .then((response) => response.json())
      .then(setData)
      .catch(console.error);
  }, [API_URL]);

  const createDefect = (e) => {
    e.preventDefault();
    fetch(API_URL + "/defects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDefect),
    })
      .then((response) => response.json())
      .then((data) => {
        setData((prevData) => [...prevData, data]);
        setNewDefect({
          object: "",
          location: "",
          shortDescription: "",
          detailDescription: "",
          reportingDate: "",
          status: "",
        });
        setShowForm(false);
      })
      .catch(console.error);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDefect({ ...newDefect, [name]: value });
  };

  const updateDefectStatus = (defectId) => {
    const defect = data.find((d) => d.id === defectId);
    const updatedDefect = { ...defect, status: newStatus };

    fetch(`${API_URL}/defects/${defectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDefect),
    })
      .then((response) => response.json())
      .then((updated) => {
        setData((prevData) =>
          prevData.map((d) => (d.id === updated.id ? updated : d))
        );
        setEditingDefectId(null);
        setNewStatus("");
        refreshData();
      })
      .catch(console.error);
  };

  const deleteDefect = (id) => {
    if (window.confirm("Delete this defect?")) {
    fetch(`${API_URL}/defects/${id}`, { method: "DELETE" })
      .then(() => setData((prevData) => prevData.filter((defect) => defect.id !== id)))
      .catch(console.error);
    }
  };

  const refreshData = () => {
    fetch(API_URL + "/defects")
      .then((response) => response.json())
      .then(setData)
      .catch(console.error);
  };

  const editDefect = (defect) => {
    setEditingDefectId(defect.id);
    setNewStatus(defect.status);
  };

  const handleFileChange = (e) => {
    setNewDefect({ ...newDefect, file: e.target.files[0] }); // Save the selected file
  };
  
  const handleFilterChange = (text, type) => {
    setFilterType(type);
    setFilterText(text);
  };

  const filteredDefects = data.filter((defect) =>
    defect[filterType || 'object'].toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <h1>Defects</h1>
      <DefectFilter onFilterChange={handleFilterChange} />
      <DefectTable
        data={data}
        filteredDefects={filteredDefects}
        filterText={filterText}
        filterType={filterType}
        editDefect={editDefect}
        deleteDefect={deleteDefect}
        refreshData={refreshData}
        toggleForm={() => setShowForm(!showForm)}
        editingDefectId={editingDefectId}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        updateDefectStatus={updateDefectStatus}
      />
      <DefectForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={createDefect}
        defect={newDefect}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
      />
    </div>
  );
}
