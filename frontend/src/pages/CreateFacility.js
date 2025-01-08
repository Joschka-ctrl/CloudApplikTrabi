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

export default function CreateFacility({edit}) {
  const [facilityName, setFacilityName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [floors, setFloors] = useState([0]);
  const [country, setCountry] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(0);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit) {
        // Fetch facility data from backend
        fetch("http://localhost:3021/api/facilities/" + id)
          .then((response) => response.json())
          .then((data) => {
            setFacilityName(data.name);
            setStreet(data.street);
            setCity(data.city);
            setZipcode(data.postalCode);
            setFloors(data.floor);
            setCountry(data.country);
          })
          .catch((error) => console.error("Error fetching facility:", error));
    }else{
      setFacilityName("");
      setStreet("");
      setCity("");
      setZipcode("");
      setFloors([0]);
      setCountry("");}
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
      floor: floors,
      maxCapacity: maxCapacity,
    };
    
    var method = "POST";
    var url = "http://localhost:3021/api/facilities";
    if(edit){
        method = "PUT"
        url = "http://localhost:3021/api/facilities/" + id;
    }
    //Upload facility to backend
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
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
    <Container>
        <Stack gap={3}>
            <h1>{edit ? "Edit Facility" : "Create Facility"}</h1>
            <form onSubmit={handleSubmit}>
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

                <Stack
                    direction="horizontal"
                    gap={3}
                    style={{ marginBottom: "16px" }}
                >
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

                <Button type="submit" variant="contained" color="primary">
                    {edit ? "Save Changes" : "Create Facility"}
                </Button>
            </form>
        </Stack>
    </Container>
);
}
