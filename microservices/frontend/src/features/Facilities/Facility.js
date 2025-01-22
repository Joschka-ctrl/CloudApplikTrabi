import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Icon,
} from "@mui/material";
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import { useAuth } from "../../components/AuthProvider";

export default function FacilityDetail() {
  const { user, currentTenantId } = useAuth();
  const FACILITY_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3021"
      : ""; 

  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const handleEditClick = () => {
    navigate(`/facilities/${id}/edit`);
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this facility?")) {
      fetch(FACILITY_API_URL + `/api/facilities/${currentTenantId}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          navigate("/facilities");
        })
        .catch((error) => {
          setError(error);
        });
    }
  };

  useEffect(() => {
    fetch(FACILITY_API_URL + `/api/facilities/${currentTenantId}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok && response.status !== 404) {
          throw new Error("Network response was not ok");
        } else if (response.status === 404) {
          setFacility(false);
          return false;
        }
        return response.json();
      })
      .then((data) => {
        setFacility(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [id]);

  if (error) {
    return (
      <Container maxWidth="sm" style={{ marginTop: "5%" }}>
        <Alert severity="error">Error: {error.message}</Alert>
      </Container>
    );
  }

  if (!facility) {
    return (
      <Container maxWidth="sm" style={{ marginTop: "5%" }}>
        <Alert severity="warning">Facility not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: "5%" }}>
      <Paper elevation={3} style={{ padding: "2rem", position: "relative" }}>
        <Stack direction="row" spacing={2} 
            style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Stack>
        <Typography variant="h4" gutterBottom>
          {facility.name}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Max Capacity:</strong> {facility.maxCapacity}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Address:</strong> {facility.street}, {facility.city},{" "}
              {facility.postalCode}, {facility.country}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Floors:</strong>
            </Typography>
            <ul>
              {facility.floors.map((floor, index) => (
                <li key={index}>{floor}</li>
              ))}
            </ul>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Facility ID:</strong> {id}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={2} style={{ marginTop: "2rem" }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "1rem", cursor: "pointer" }} onClick={() => navigate(`/parkingspaces/${id}`)} >
            <Stack direction="row" spacing={2} alignItems={"center"}>
            <ArrowBack color="primary"></ArrowBack>
            <Typography variant="h6">Facility Parking Status</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "1rem", cursor: "pointer" }} onClick={() => navigate(`/defects/${id}`)}>
            <Stack direction="row-reverse" spacing={2} alignItems={"center"}>
            <ArrowForward color="primary"></ArrowForward>
            <Typography variant="h6">Facility Defect Status</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
