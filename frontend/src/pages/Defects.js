import React, { useEffect, useState } from "react";
import DefectTable from "../components/DefectsTable.js";
import DefectForm from "../components/DefectsForm.js";
import DefectDetail from "../components/DefectDetail.js";
import DefectFilter from "./defectFilters.js";
import EditDefect from "../components/EditDefect.js";

export default function Defects() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showDefectDetail, setShowDefectDetail] = useState(false);
  const [detailedDefectId, setDetailedDefectId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditDefectPage, setShowEditDefectPage] = useState(false);
  const [detailDefect, setDetailDefect] = useState(null);
  const [editingDefectId, setEditingDefectId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newDefect, setNewDefect] = useState({
    object: "",
    location: "",
    shortDescription: "",
    detailDescription: "",
    reportingDate: "",
    status: "",
    file: null,
  });

  const API_URL =
    process.env.NODE_ENV === "development"
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

    const { file, ...defectData } = newDefect;

    fetch(API_URL + "/defects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defectData),
    })
      .then((response) => response.json())
      .then((data) => {
        setData((prevData) => [...prevData, data]);

        if (file) {
          const formData = new FormData();
          formData.append("picture", file);

          fetch(`${API_URL}/defects/${data.id}/uploadPicture`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((uploadData) => {
              setData((prevData) =>
                prevData.map((defect) =>
                  defect.id === data.id
                    ? { ...defect, imageUrl: uploadData.imageUrl }
                    : defect
                )
              );
            })
            .catch(console.error);
        }

        setNewDefect({
          object: "",
          location: "",
          shortDescription: "",
          detailDescription: "",
          reportingDate: "",
          status: "",
          file: null,
        });
        setShowForm(false);
      })
      .catch(console.error);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDefect({ ...newDefect, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewDefect((prevDefect) => ({ ...prevDefect, file }));
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

  const deleteDefectNoDialog = (id) => {
    fetch(`${API_URL}/defects/${id}`, { method: "DELETE" })
      .then(() =>
        setData((prevData) => prevData.filter((defect) => defect.id !== id))
      )
      .catch(console.error);
  };

  const refreshData = async () => {
    if (filterText && filterType) {
      await fetch(
        API_URL +
          "/defects?filterType=" +
          filterType +
          "&filterText=" +
          filterText
      )
        .then((response) => response.json())
        .then(setData)
        .catch(console.error);
    } else {
      fetch(API_URL + "/defects")
        .then((response) => response.json())
        .then(setData)
        .catch(console.error);
    }
  };

  const handleFilterChange = (text, type) => {
    setFilterType(type);
    setFilterText(text);
  };

  useEffect(() => {
    refreshData();
  }, [filterText, filterType]);

  const updateDefect = (updatedDefect) => {
    fetch(`${API_URL}/defects/${updatedDefect.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDefect),
    })
      .then((response) => response.json())
      .then((data) => {
        setData((prevData) =>
          prevData.map((defect) => (defect.id === data.id ? data : defect))
        );
        refreshData();
      })
      .catch(console.error);
  };

  return (
    <div className="d-flex justify-content-center flex-column">
      <h1>Defects</h1>
      <DefectFilter onFilterChange={handleFilterChange} />
      <p>Editing State: {showEditDefectPage}</p>
      {showEditDefectPage ? true : false}
      <DefectTable
        filteredDefects={data}
        refreshData={refreshData}
        toggleForm={() => setShowForm(!showForm)}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        updateDefectStatus={updateDefectStatus}
        showDefectDetail={setShowDefectDetail}
        defectDetailId={setDetailedDefectId}
      />
      <DefectForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={createDefect}
        defect={newDefect}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
      />
      <DefectDetail
        show={showDefectDetail}
        defectId={detailedDefectId}
        onClose={() => setShowDefectDetail(false)}
        editDefect={(defect) => {
          setDetailDefect(defect);
          setShowEditDefectPage(true);
          console.log("Opening Edit Defect Dialog", showEditDefectPage);
        }}
        deleteDefect={deleteDefectNoDialog}
      />
      <EditDefect
        show={showEditDefectPage}
        onClose={() => setShowEditDefectPage(false)}
        defect={detailDefect}
        updateDefect={updateDefect}
        deleteDefect={deleteDefectNoDialog}
        backToDetail={(defectId) => {
          setShowDefectDetail(true);
          setDetailedDefectId(defectId);
        }}
      />
    </div>
  );
}
