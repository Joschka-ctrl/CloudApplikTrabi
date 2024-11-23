let parkingSpots = [{ id: "1", occupied: false}, { id: "2", occupied: true }];

const getAllParkingSpots = () => {
    return parkingSpots;
};

const getParkingSpotById = (id) => {
    return parkingSpots.find(s => s.id === id);
};

const createParkingSpot = (id, occupied) => {
    if (parkingSpots.find(s => s.id === id)) {
        throw new Error('Parking spot with this ID already exists');
    }
    const newSpot = { id, occupied };
    parkingSpots.push(newSpot);
    return newSpot;
};
const changeOccupancy = (id, newStatus) => {
    const spot = parkingSpots.find(s => s.id === id);
    if (!spot) {
        throw new Error('Parking spot not found');
    }
    spot.occupied = newStatus;
    console.log(`Changing occupancy of spot ${id} to: ${newStatus}`);
    return { success: true, id, status: newStatus };
};

const getParkingDuration = (carId) => {
    // Logik für Parkdauer einsehen
    console.log(`Fetching parking duration for car: ${carId}`);
    return { carId, duration: "2 hours" };
};

const startParking = (carId) => {
    // Logik für Parkvorgang starten
    console.log(`Starting parking for car: ${carId}`);
    return { carId, started: true };
};

module.exports = {
    changeOccupancy, 
    getParkingDuration, 
    startParking,
    getAllParkingSpots,
    getParkingSpotById,
    createParkingSpot
};