import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";

const FACILITY_API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3021"
      : ""; 

export default function CreateFacility({ edit }) {
  const { user, currentTenantId } = useAuth();

  const [facilityName, setFacilityName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [floors, setFloors] = useState([0]);
  const [country, setCountry] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [pricePerMinute, setPricePerMinute] = useState(0.0);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit) {
      // Fetch facility data from backend
      fetch(`${FACILITY_API_URL}/api/facilities/${currentTenantId}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setFacilityName(data.name);
          setStreet(data.street);
          setCity(data.city);
          setZipcode(data.postalCode);
          setFloors(data.floor);
          setCountry(data.country);
          setPricePerMinute(data.pricePerMinute);
        })
        .catch((error) => console.error("Error fetching facility:", error));
    } else {
      setFacilityName("");
      setStreet("");
      setCity("");
      setZipcode("");
      setFloors([0]);
      setCountry("");
      setPricePerMinute(0);
    }
  }, [edit]);

  useEffect(() => {
    const totalCapacity = floors.reduce(
      (sum, floor) => sum + (parseInt(floor) || 0),
      0
    );
    setMaxCapacity(totalCapacity);
  }, [floors]);

  const addFloor = () => {
    setFloors([...floors, 0]);
  };

  const removeFloor = (index) => {
    const newFloors = floors.filter((_, i) => i !== index);
    setFloors(newFloors);
  };

  const handleFloorChange = (index, value) => {
    const newFloors = [...floors];
    newFloors[index] = value;
    setFloors(newFloors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const facility = {
      name: facilityName,
      street: street,
      city: city,
      postalCode: zipcode,
      country: country,
      floors: floors,
      maxCapacity: maxCapacity,
      pricePerMinute: pricePerMinute,
    };

    var method = "POST";
    var url = `${FACILITY_API_URL}/api/facilities/${currentTenantId}`;
    if (edit) {
      method = "PUT";
      url = `${FACILITY_API_URL}/api/facilities/${currentTenantId}/${id}`;
    }
    //Upload facility to backend
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify(facility),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Facility created successfully");
          navigate("/facilities");
        } else {
          console.error("Failed to create facility");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Handle form submission logic here
    console.log("Facility Created:");
  };

  return (
    <Container className="mt-5 pt-5">
        <h1 style={{
          borderBottom: "1px solid #ccc",
          paddingBottom: "8px",
          paddingRight: "32px",
          width: "fit-content"
            }}>{edit ? "Edit Facility" : "Create a new Facility"}</h1>

          <Stack gap={3} p={2}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" component="h3" mb={2} color="textSecondary">
            Location and Name
          </Typography>
          <div>
            <TextField
              label="Facility Name"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <TextField
              label="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>

          <div
            style={{
              width: "100%",
              borderTop: "1px solid #ccc",
              margin: "16px 0",
            }}
          ></div>

          <Typography variant="h5" component="h3" mb={4} color="textSecondary">
            Facility Details
          </Typography>

          <Stack direction="row" gap={3}>
            <Stack direction="row" style={{ marginBottom: "16px" }} spacing={2}>
              <Stack>
                <Typography variant="h6" gutterBottom>
                  Floors
                </Typography>
                <Button
                  onClick={addFloor}
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                >
                  Add Floor
                </Button>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginTop: "auto", fontWeight: "bold" }}
                  gutterBottom
                >
                  Capacity: {maxCapacity}
                </Typography>
              </Stack>

              <Stack
                style={{
                  border: "1px solid #ccc",
                  height: "240px",
                  overflowY: "scroll",
                  padding: "16px",
                  width: "500px",
                }}
              >
                {floors.map((floor, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Typography variant="body1" style={{ marginRight: "16px" }}>
                      Floor {index + 1}
                    </Typography>
                    <TextField
                      label="Parking Spaces"
                      value={floor}
                      onChange={(e) => handleFloorChange(index, e.target.value)}
                      style={{ marginRight: "16px", flexGrow: 1 }}
                    />
                    {floors.length > 1 && (
                      <IconButton onClick={() => removeFloor(index)}>
                        <Delete />
                      </IconButton>
                    )}
                  </div>
                ))}
              </Stack>
            </Stack>

            <Stack
              direction="column"
              alignItems="flex-start"
              spacing={1}
              style={{ marginInline: "auto" }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  type="number"
                  label="Price Per Minute"
                  value={pricePerMinute}
                  onChange={(e) =>
                    setPricePerMinute(parseFloat(e.target.value))
                  }
                  inputProps={{ step: 0.01 }}
                  fullWidth
                  margin="normal"
                />
                <Typography variant="body1">€</Typography>
              </Stack>
            </Stack>
          </Stack>

          <div
            style={{
              width: "100%",
              borderTop: "1px solid #ccc",
              margin: "16px 0",
            }}
          ></div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ float: "right" }}
          >
            {edit ? "Save Changes" : "Create Facility"}
          </Button>
        </form>
      </Stack>
    </Container>
  );
}
