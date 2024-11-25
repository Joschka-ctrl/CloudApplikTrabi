const { Timestamp } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
let parkingSpots = [{ id: "1", occupied: false }, { id: "2", occupied: true }];

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
let carsInParkingFacility = [{ ticketNumber: "1234", parkingStartedAt: Timestamp.now(), payedAt: [], parkingEndedAt: null }];


const addCarToParkingFacility = (ticketNumber) => {
    if (carsInParkingFacility.find(c => c.ticketNumber === ticketNumber)) {
        throw new Error('Car with this ticket number already exists');
    }
    const newCar = { ticketNumber, parkingStartedAt: Timestamp.now(), parkingEndedAt: null, payedAt: [] };
    carsInParkingFacility.push(newCar);
    console.log(newCar.payedAt.length);
    return newCar;
};

const updateCarParkingEndedAt = (ticketNumber, parkingEndedAt) => {
    const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car || car.parkingEndedAt) {
        throw new Error('Car with this ticket number not found or already left the parking facility');
    }
    car.parkingEndedAt = parkingEndedAt;
    return car;
};

const updateCarPayedAt = (ticketNumber, payedAt) => {
    const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car || car.parkingEndedAt) {
        throw new Error('Car with this ticket number not found or already left the parking facility');
    }
    car.payedAt.push(payedAt);
    console.log(car.payedAt.length);
    return car;
};




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
        addCarToParkingFacility(ticketNumber);
        return { ticketNumber };
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


let allowedDurationAfterPaymentinMinutes = 0.5
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

    if (car.parkingEndedAt) {
        durationMillis = car.parkingEndedAt.toDate().getTime() - car.parkingStartedAt.toDate().getTime();
        console.log("0 + " + durationMillis);
    } else if (car.payedAt.length > 0 && (Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime()) > getMinutesInMillis(allowedDurationAfterPaymentinMinutes)) {
        durationMillis = Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime();
        console.log("1 + " + durationMillis);
        let wholeTime = Date.now() - car.parkingStartedAt.toDate().getTime();
        console.log("vs the whole Time: " + wholeTime);
    } else if (car.payedAt.length > 0  && (Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime()) < getMinutesInMillis(allowedDurationAfterPaymentinMinutes)) {
        durationMillis = 0;
        console.log("2 + " + durationMillis);
    } else {
        durationMillis = Date.now() - car.parkingStartedAt.toDate().getTime();
        console.log("3 + " + durationMillis);
    }
    const minutes = durationMillis / (1000 * 60);
    return minutes;

};

const getMinutesInMillis = (minutes) => {
    return minutes * 60 * 1000;
}

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
    if (!car || car.parkingEndedAt) {
        throw new Error('Car with this ticket number not found or already left the parking facility');
    }
    const parkingDuration = getParkingDuration(ticketNumber);
    const pricing = getPricingFromPropertyServiceMock();
    const fee = pricing * parkingDuration;
    return fee;
};

const payParkingFee = (ticketNumber) => {
    const fee = getParkingFee(ticketNumber);
    const duration = getParkingDuration(ticketNumber);
    // Call payment service to process payment
    

    let success = mockPaymentService(fee) && duration > 0;
    if (success) {
        console.log(`Payment processed for car with ticket number ${ticketNumber}. Fee: ${fee}. duration: ${duration}`);
        updateCarPayedAt(ticketNumber, Timestamp.now());
    }
    return success;
};

const mockPaymentService = (fee) => {
    return true;
};

const leaveParkhouse = (ticketNumber) => {
    const car = carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car || car.parkingEndedAt) {
        throw new Error('Car with this ticket number not found or already left the parking facility');
    }
    if (car.payedAt.length > 0  && getParkingDuration(ticketNumber) == 0) {
        currentOccupancy--;
        updateCarParkingEndedAt(ticketNumber, Timestamp.now());
        return { success: true, ticketNumber };
    } else {
        return { error: 'open Payment' };
    }
}

module.exports = {
    getAllParkingSpots,
    getParkingSpotById,
    createParkingSpot,
    getTicketNumber,
    getCurrentOccupancy,
    getParkingDuration,
    manageParkingSpotOccupancy,
    getParkingFee,
    payParkingFee,
    leaveParkhouse
};