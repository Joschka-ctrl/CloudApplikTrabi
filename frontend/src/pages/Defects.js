import React, { useEffect, useState } from "react";
import {auth} from "../firebase"; // Importiere die Firebase-Instanz
import DefectTable from "../components/DefectsTable.js";
import DefectForm from "../components/DefectsForm.js";
import DefectDetail from "../components/DefectDetail.js";
import DefectFilter from "./defectFilters.js";
import EditDefect from "../components/EditDefect.js";
import { useNavigate } from "react-router-dom";

export default function Defects({ onLogin }) {
  const navigate = useNavigate();
  if (!user) {
    navigate("/login");
  }
    
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
  const [user, setUser] = useState(null); // Zustand für authentifizierten Benutzer
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
    // Authentifizierten Benutzer setzen
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const fetchAuthToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await fetchAuthToken();
      fetch(API_URL + "/defects", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then(setData)
        .catch(console.error);
    };
    fetchData();
  }, [API_URL, user]);

  const createDefect = async (e) => {
    e.preventDefault();

    const token = await fetchAuthToken();
    const { file, ...defectData } = newDefect;

    fetch(API_URL + "/defects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
            headers: { Authorization: `Bearer ${token}` },
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

  const updateDefectStatus = async (defectId) => {
    const token = await fetchAuthToken();
    const defect = data.find((d) => d.id === defectId);
    const updatedDefect = { ...defect, status: newStatus };

    fetch(`${API_URL}/defects/${defectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

  const deleteDefect = async (id) => {
    const token = await fetchAuthToken();
    if (window.confirm("Delete this defect?")) {
      fetch(`${API_URL}/defects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() =>
          setData((prevData) => prevData.filter((defect) => defect.id !== id))
        )
        .catch(console.error);
    }
  };
  const handleFilterChange = (text, type) => {
    setFilterType(type);
    setFilterText(text);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDefect({ ...newDefect, [name]: value });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewDefect((prevDefect) => ({ ...prevDefect, file }));
  };
  
  const refreshData = async () => {
    const token = await fetchAuthToken();
    const url = filterText && filterType
      ? `${API_URL}/defects?filterType=${filterType}&filterText=${filterText}`
      : `${API_URL}/defects`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, [filterText, filterType]);

  return (
    <div className="d-flex justify-content-center flex-column">
      <h1>Defects</h1>
      {user ? (
        <>
          <DefectFilter onFilterChange={handleFilterChange} />
          <DefectTable
            filteredDefects={data}
            refreshData={refreshData}
            toggleForm={() => setShowForm(!showForm)}
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
        </>
      ) : (
        <p>Please log in to view defects.</p>
      )}
    </div>
  );
}
