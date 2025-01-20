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
  Button
} from "@mui/material";

export default function FacilityDetail() {
  const FACILITY_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3021"
      : process.env.REACT_APP_API_URL;

  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const handleEditClick = () => {
    navigate(`/facilities/${id}/edit`);
  };

  useEffect(() => {
    fetch(FACILITY_API_URL + `/api/facilities/${id}`)
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
            <Button
                variant="contained"
                color="primary"
                onClick={handleEditClick}
                style={{ position: "absolute", top: "1rem", right: "1rem" }}
            >
                Edit
            </Button>
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
                        {facility.floor.map((floor, index) => (
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
    </Container>
);
}
