const { Timestamp } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
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



let maxCapacity = 3;
let currentOccupancy = 0;
let carsInParkingFacility = [{ ticketNumber: "1234", parkingStartedAt : Timestamp.now(), parkingEndedAt: null }, { ticketNumber: "5678", parkingStartedAt : Timestamp.now(), parkingEndedAt: null }];

/**
 * Generates a ticket number if the parking lot is not at maximum capacity.
 * 
 * @returns {Object} An object containing either a ticket number or an error message.
 * @property {string} [ticketNumber] - The generated ticket number if there is available space. --> kann als id für das Auto genutzt werden
 * @property {string} [error] - An error message if the parking lot is at maximum capacity.
 */
const getTicketNumber = () => {
    // Check parking occupancy
    if (currentOccupancy < maxCapacity) {
        currentOccupancy++;
        const ticketNumber = uuidv4();
        carsInParkingFacility.push({ ticketNumber, parkingStartedAt: Timestamp.now(), parkingEndedAt: null });
        return { ticketNumber};
    } else {
        console.error('Parking lot is at maximum capacity');
        return { error: 'Parking lot is at maximum capacity' };
    }
};

const getCurrentOccupancy = () => {
    return currentOccupancy;
};

const checkParkingFacilityOccupancy = () => {
    return currentOccupancy < maxCapacity;
};


/**
 * Manages the occupancy status of a parking spot.
 *
 * @param {number} id - The ID of the parking spot to update.
 * @param {boolean} newStatus - The new occupancy status of the parking spot (true for occupied, false for free).
 * @returns {Object} An object containing the success status, the parking spot ID, and the new status.
 * @throws {Error} If the parking spot is not found or if the parking spot is already in the desired status.
 */
const manageParkingSpotOccupancy = (id, newStatus) => {
    const spot = parkingSpots.find(s => s.id === id);
    if (!spot) {
        throw new Error('Parking spot not found');
    }
    if (spot.occupied === newStatus) {
        throw new Error(`Parking spot ${id} is already ${newStatus ? 'occupied' : 'free'}`);
    }
    spot.occupied = newStatus;
    console.log(`Changing occupancy of spot ${id} to: ${newStatus}`);
    return { success: true, id, status: newStatus };
};


/**
 * Calculates the parking duration for a car based on its ticket number.
 *
 * @param {string} ticketNumber - The ticket number of the car.
 * @returns {string} The parking duration in the format "Xd Xh Xm Xs".
 * @throws {Error} If a car with the given ticket number is not found.
 */
const getParkingDuration = (ticketNumber) => {
    const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car) {
        throw new Error('Car with this ticket number not found');
    }

    let durationMillis;
    
    if (car.parkingEndedAt && (Date.now() - car.parkingEndedAt.toDate().getTime()) < 2 * 60 * 1000) {
        // If car.parkingEndedAt is not null and the parking ended less than 20 minutes ago
        durationMillis = car.parkingEndedAt.toDate().getTime() - car.parkingStartedAt.toDate().getTime();
    } else {
        // If car.parkingEndedAt is null or the parking ended more than 20 minutes ago
        durationMillis = Date.now() - car.parkingStartedAt.toDate().getTime();
    }

    const minutes = durationMillis / (1000 * 60);
    return minutes;
};

/**
 * Retrieves the pricing information from the property service.
 * ToDO: Implement the actual call to the property service. ( Preis pro minute?)
 * @returns {number} The pricing value retrieved from the property service.
 */
const getPricingFromPropertyServiceMock = () => {
    // Call property service to get pricing
    return 1.5; // Mock pricing value
};

const getParkingFee = (ticketNumber) => {
    const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car) {
        throw new Error('Car with this ticket number not found');
    }
    const parkingDuration = getParkingDuration(ticketNumber);
    const pricing = getPricingFromPropertyServiceMock();
    const fee = pricing * parkingDuration;

    return fee;
};

const payParkingFee = (ticketNumber) => {
    const fee = getParkingFee(ticketNumber);
    // Call payment service to process payment
    console.log(`Payment processed for car with ticket number ${ticketNumber}. Fee: ${fee}`);
    let success = mockPaymentService(fee);
    if(success){
        const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
        car.parkingEndedAt = Timestamp.now()
    }

    return success;
};

const mockPaymentService = (fee) => {
   return true;
};

module.exports = {
    getAllParkingSpots,
    getParkingSpotById,
    createParkingSpot,
    getTicketNumber,
    getCurrentOccupancy,
    getParkingDuration,
    manageParkingSpotOccupancy,
    getParkingFee,
    payParkingFee
};