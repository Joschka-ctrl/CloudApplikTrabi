import React from "react";
import { Button, Card, CardContent, Container, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";

export default function Facilities() {
  const FACILITY_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3021"
      : process.env.REACT_APP_API_URL;

  const [facilities, setFacilities] = React.useState([]);

  React.useEffect(() => {
    fetch(`${FACILITY_API_URL}/api/facilities`)
      .then((response) => response.json())
      .then((data) => setFacilities(data))
      .catch((error) => console.error("Error fetching facilities:", error));
  }, []);

const navigate = useNavigate();

return (
    <Container className="mt-5 pt-5">
        <Grid container justifyContent="flex-end">
            <Grid item>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/facilities/new")}
                >
                    Create New Facility
                </Button>
            </Grid>
        </Grid>
        <Grid className="mt-2" container spacing={3}>
            {facilities.map((facility) => (
                <Grid item xs={12} sm={6} md={4} key={facility.facilityId}>
                    <Card
                        style={{ position: "relative", cursor: "pointer" }}
                        onClick={() => navigate(`/facilities/${facility.facilityId}`)}
                    >
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    fontWeight: "bold",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {facility.facilityId}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {facility.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {facility.street}, {facility.city}, {facility.postalCode},{" "}
                                {facility.country}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Max Capacity: {facility.maxCapacity}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Floors: {facility.floor.join(", ")}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Occupancy Level:
                            </Typography>
                            <LinearProgress variant="determinate" value={47} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </Container>
);
}
