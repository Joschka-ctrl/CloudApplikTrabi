const { Timestamp } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();



// Parkhaus
let parkingSpots = [{ id: "1", occupied: false }, { id: "2", occupied: true }];


const newParkingFacility = async (newFacility) => {
    newFacility.id = uuidv4();
    const docRef = await db.collection("parking-facility").add(newFacility); 

    docRef.FacilityID = newFacility.id;
    return docRef;
}

/**
 * Fetches the data of a parking facility based on the provided facility ID and tenant ID.
 *
 * @param {string} facilityID - The ID of the parking facility to fetch.
 * @param {string} tenantID - The ID of the tenant associated with the parking facility.
 * @returns {Promise<Object>} A promise that resolves to the data of the parking facility.
 * @throws Will log an error if no facility is found with the given facility ID and tenant ID.
 */
const getFacilityData = async (facilityID, tenantID) => {
    // Fetch the parking facility document
    const snapshot = await db.collection("parking-facility")
        .where("id", "==", facilityID)
        .where("tenantId", "==", tenantID)
        .get();

    if (snapshot.empty) {
        console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
    }
    const doc = snapshot.docs[0];
    const facilityData = doc.data();
    return facilityData;
};

const getDoc = async (facilityID, tenantID) => {
    const snapshot = await db.collection("parking-facility")
        .where("id", "==", facilityID)
        .where("tenantId", "==", tenantID)
        .get();

    if (snapshot.empty) {
        console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
    }

    const doc = snapshot.docs[0];
    console.log(doc.id);
    return doc;
}

const getAllParkingSpotsOfFacility = async (facilityID, tenantID) => {
    try {
        // Query the Firestore collection "parking-facility" for documents where tenantId matches
        const snapshot = await db.collection("parking-facility")
            .where("id", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        // Check if there are matching documents
        if (snapshot.empty) {
            console.log('No matching parking facilities found.');
            return [];
        }

        // Extract parking spots from the retrieved documents
        const parkingSpots = [];
        snapshot.forEach(doc => {
            const facilityData = doc.data();
            facilityData.parkingSpacesOnFloor.forEach(floor => {
                parkingSpots.push(...floor.spots);
            });
        });
        console.log(parkingSpots);
        return parkingSpots;
    } catch (error) {
        console.error('Error fetching parking spots:', error);
        console.error('Failed to fetch parking spots.');
    }
};

const getParkingSpotById = async (facilityID, tenantID, spotID) => {
    try {
        // Query the Firestore collection "parking-facility" for the specific facility and tenant
        const snapshot = await db.collection("parking-facility")
            .where("id", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        // Check if there are matching documents
        if (snapshot.empty) {
            console.log(`No matching facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
            return null;
        }

        // Extract the parking spot by ID
        let parkingSpot = null;
        snapshot.forEach(doc => {
            const facilityData = doc.data();
            console.log(facilityData);
            for (const floor of facilityData.parkingSpacesOnFloor) {
                const spot = floor.spots.find(s => s.id === spotID);
                if (spot) {
                    parkingSpot = spot;
                    break;
                }
            }
        });

        if (!parkingSpot) {
            console.log(`No parking spot found with ID: ${spotID} in facility: ${facilityID}`);
        }

        return parkingSpot;
    } catch (error) {
        console.error('Error fetching parking spot:', error);
        console.error('Failed to fetch parking spot.');
    }
};

const createParkingSpot = (id, occupied) => {
    if (parkingSpots.find(s => s.id === id)) {
        console.error('Parking spot with this ID already exists');
    }
    const newSpot = { id, occupied };
    parkingSpots.push(newSpot);
    return newSpot;
};

let maxCapacity = 3;
let currentOccupancy = 0; // Current number of occupied parking spots within the parking facility
let carsInParkingFacility = [{ ticketNumber: "1234", parkingStartedAt: Timestamp.now(), payedAt: [], parkingEndedAt: null }];

const addCarToParkingFacility = async (facilityID, tenantID, ticketNumber) => {
    try {
        // Fetch the parking facility document
        const snapshot = await db.collection("parking-facility")
            .where("id", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
        }

        // Loop through the matching documents (should typically be one)
        let addedCar = null;
        const doc = snapshot.docs[0];
        const facilityData = doc.data();

        // Check if the ticket number already exists
        if (facilityData.carsInParkingFacility.find(c => c.ticketNumber === ticketNumber)) {
            console.error('Car with this ticket number already exists');
        }

        // Create the new car object
        const newCar = {
            ticketNumber,
            parkingStartedAt: Timestamp.now(),
            parkingEndedAt: null,
            payedAt: []
        };

        // Add the new car to the carsInParkingFacility array
        facilityData.carsInParkingFacility.push(newCar);

        // Update the Firestore document
        await db.collection("parking-facility").doc(doc.id).update({
            carsInParkingFacility: facilityData.carsInParkingFacility
        });

        console.log('Car successfully added to parking facility');
        return addedCar;
    } catch (error) {
        console.error('Error adding car to parking facility:', error);
        console.error('Failed to add car to parking facility.');
    }
};

const updateCarParkingEndedAt = async (ticketNumber, parkingEndedAt, facility, docID) => {
    try {

        const carIndex = facility.carsInParkingFacility.findIndex(c => c.ticketNumber === ticketNumber);

        if (carIndex === -1 || facility.carsInParkingFacility[carIndex].parkingEndedAt) {
            throw new Error('Car with this ticket number not found or already left the parking facility.');
        }

        // Update the car's parkingEndedAt field
        facility.carsInParkingFacility[carIndex].parkingEndedAt = parkingEndedAt;

        // Save the updated facility data back to Firestore
        await db.collection("parking-facility").doc(docID).update({
            carsInParkingFacility: facility.carsInParkingFacility
        });

        return facility.carsInParkingFacility[carIndex];
    } catch (error) {
        console.error('Error updating car parking ended at:', error);
        throw new Error('Failed to update car parking ended at.');
    }
};

const updateCarPayedAt = async (ticketNumber, payedAt, facilityID, tenantID) => {
    const facility = await getFacilityData(facilityID, tenantID); // bekommt das facility object
    const car = await getCarFromParkingFacility(ticketNumber, facility); // bekommt das car object
    if (!car || car.parkingEndedAt) {
        console.error('Car with this ticket number not found or already left the parking facility');
    }
    car.payedAt.push(payedAt);
    console.log(car.payedAt);
    // update car in parking facility in DB 

    const doc = await getDoc(facilityID, tenantID);
    console.log(doc.id);
    await db.collection("parking-facility").doc(doc.id).update({
        carsInParkingFacility: facility.carsInParkingFacility
    });
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
const getTicketNumber = async (tenantID, facilityID) => {
    try {
        // Fetch the parking facility document
        const snapshot = await db.collection("parking-facility")
            .where("id", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
        }

        // Access the first document (assuming only one document matches)
        const doc = snapshot.docs[0];
        const facilityData = doc.data();

        console.log(facilityData);
        const { currentOccupancy, maxCapacity } = facilityData;

        console.log(`Current occupancy: ${currentOccupancy}, Max capacity: ${maxCapacity}`);

        // Check if currentOccupancy is less than maxCapacity
        if (currentOccupancy < maxCapacity) {
            const newOccupancy = currentOccupancy + 1;

            // Update Firestore with the new occupancy
            await db.collection("parking-facility").doc(doc.id).update({
                currentOccupancy: newOccupancy
            });

            console.log(`Occupancy updated to: ${newOccupancy}`);

            // Add car to parking facility
            const ticketNumber = uuidv4();
            await addCarToParkingFacility(facilityID, tenantID, ticketNumber);
            console.log(`Car with ticket number ${ticketNumber} added to parking facility`);

            return { ticketNumber };
        } else {
            console.error('Parking facility is at maximum capacity.');
        }
    } catch (error) {
        console.error('Error updating occupancy:', error);
        console.error('Failed to update occupancy.');
    }
};

const getCurrentOccupancy = async (tenantID, facilityID) => {
    try {
        const facilityData = getFacilityData(facilityID, tenantID);

        console.log(facilityData);
        const { currentOccupancy } = facilityData;
        return currentOccupancy;
    }
    catch (error) {
        console.error('Error fetching current occupancy:', error);
        console.error('Failed to fetch current occupancy.');
    }
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

const manageParkingSpotOccupancy = async (tenantID, facilityID, spotID, newStatus) => {
    console.log("Manage Parking Spot Occupancy");
    try {
        const facilityData = await getFacilityData(facilityID, tenantID);
        console.log(facilityData);
        // Locate the parking spot
        let spotFound = false;
        facilityData.parkingSpacesOnFloor.forEach(floor => {
            const spot = floor.spots.find(s => s.id === spotID);
            if (spot) {
                if (spot.occupied === newStatus) {
                    console.error(`Parking spot ${spotID} is already ${newStatus ? 'occupied' : 'free'}`);
                }
                spot.occupied = newStatus;
                spotFound = true;
            }
        });


        if (!spotFound) {
            console.error(`Parking spot with ID ${spotID} not found`);
        }
        const doc = await getDoc(facilityID, tenantID);
        console.log(doc.id);
        // Update Firestore with the new occupancy status
        await db.collection("parking-facility").doc(doc.id).update({
            parkingSpacesOnFloor: facilityData.parkingSpacesOnFloor
        });

        console.log(`Successfully updated parking spot ${spotID} to status: ${newStatus}`);
        return { success: true, spotID, status: newStatus };
    } catch (error) {
        console.error('Error managing parking spot occupancy:', error);
        console.error('Failed to update parking spot occupancy.');
    }
};

const getCarFromParkingFacility = async (ticketNumber, facilityData) => {

    // Find the car in the carsInParkingFacility array
    const car = facilityData.carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car) {
        throw new Error(`Car with ticket number ${ticketNumber} not found in facility ${facilityID}`);
    }
    return car;
};

let allowedDurationAfterPaymentinMinutes = 0.5
/**
 * Calculates the parking duration for a car based on its ticket number.
 *
 * @param {string} ticketNumber - The ticket number of the car.
 * @returns {string} The parking duration in the format "Xd Xh Xm Xs".
 * @throws {Error} If a car with the given ticket number is not found.
 */
const getParkingDuration = async (ticketNumber, facility) => {

    const car = await getCarFromParkingFacility(ticketNumber, facility);
    let durationMillis;

    if (car.parkingEndedAt) {
        durationMillis = car.parkingEndedAt.toDate().getTime() - car.parkingStartedAt.toDate().getTime();
        console.log("0 + " + durationMillis);
    } else if (car.payedAt.length > 0 && (Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime()) > getMinutesInMillis(allowedDurationAfterPaymentinMinutes)) {
        durationMillis = Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime();
        console.log("1 + " + durationMillis);
        let wholeTime = Date.now() - car.parkingStartedAt.toDate().getTime();
        console.log("vs the whole Time: " + wholeTime);
    } else if (car.payedAt.length > 0 && (Date.now() - car.payedAt[car.payedAt.length - 1].toDate().getTime()) < getMinutesInMillis(allowedDurationAfterPaymentinMinutes)) {
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
 * ToDO: Implement the actual call to the property service. ( Preis pro minute )
 * @returns {number} The pricing value retrieved from the property service.
 */
const getPricingFromPropertyServiceMock = () => {
    // Call property service to get pricing
    return 0.2; // Mock pricing value : 20 ct pro minute
};

const getParkingFee = async (ticketNumber, facility) => {
    const car = await getCarFromParkingFacility(ticketNumber, facility);
    if (!car || car.parkingEndedAt) {
        console.error('Car with this ticket number not found or already left the parking facility');
    }
    const parkingDuration = await getParkingDuration(ticketNumber, facility);
    console.log("Parking Duration: " + parkingDuration);
    const pricing = getPricingFromPropertyServiceMock();
    console.log("Pricing: " + pricing);
    const fee = pricing * parkingDuration;
    return fee;
};

const payParkingFee = async (ticketNumber, tenantID, facilityID) => {
    console.log("Pay Parking Fee");
    const facility = await getFacilityData(facilityID, tenantID);

    const fee = await getParkingFee(ticketNumber, facility);
    const duration = await getParkingDuration(ticketNumber, facility);
    // Call payment service to process payment
    console.log("Fee: " + fee + " Duration: " + duration);

    let success = mockPaymentService(fee) && duration > 0;
    if (success) {
        console.log(`Payment processed for car with ticket number ${ticketNumber}. Fee: ${fee}. duration: ${duration}`);
        await updateCarPayedAt(ticketNumber, Timestamp.now(), facilityID, tenantID);
    }
    return success;
};

const mockPaymentService = (fee) => {
    return true;
};

const leaveParkhouse = async (ticketNumber, tenantID, facilityID) => {
    try {
        // Fetch the facility data using the facilityID and tenantID
        const facility = await getFacilityData(facilityID, tenantID);
        
        // Get the car details from the parking facility
        const car = await getCarFromParkingFacility(ticketNumber, facility);
        
        if (!car || car.parkingEndedAt) {
            throw new Error('Car with this ticket number not found or already left the parking facility.');
        }
        
        // Check if the car has a payment made and if the parking duration is 0
        if (car.payedAt.length > 0 && await getParkingDuration(ticketNumber, facility) == 0) {
            // Decrease the current occupancy count
            let currentOccupancy = facility.currentOccupancy - 1;

            const doc = await getDoc(facilityID, tenantID);
            // Update the occupancy count in Firestore
            await db.collection("parking-facility").doc(doc.id).update({
                currentOccupancy: currentOccupancy
            });

            // Update the car's parkingEndedAt timestamp
            await updateCarParkingEndedAt(ticketNumber, Timestamp.now(), facility, doc.id);

            return { success: true, ticketNumber };
        } else {
            return { error: 'open Payment' };
        }
    } catch (error) {
        console.error('Error leaving parking facility:', error);
        throw new Error('Failed to leave parking facility.');
    }
};


// funktionen für Reports
const getFacilitiesOfTenant = async (tenantID) => {
    const snapshot = await db.collection("parking-facility")
        .where("tenantId", "==", tenantID)
        .get();

    if (snapshot.empty) {
        console.error(`No facilities found for tenant with ID: ${tenantID}`);
    }

    const facilities = [];
    snapshot.forEach(doc => {
        const facilityData = doc.data();
        const facilityDataToReturn = {
            id: facilityData.id,
            name: facilityData.name,
            maxCapacity: facilityData.maxCapacity,
            floors: facilityData.parkingSpacesOnFloor.length,
            street: facilityData.street,
            city: facilityData.city,
            postalCode: facilityData.postalCode,
            country: facilityData.country,
            
        };

        facilities.push(facilityDataToReturn);
    });

    return facilities;
};

module.exports = {
    newParkingFacility,
    getAllParkingSpotsOfFacility,
    getParkingSpotById,
    createParkingSpot,
    getTicketNumber,
    getCurrentOccupancy,
    getParkingDuration,
    manageParkingSpotOccupancy,
    getParkingFee,
    payParkingFee,
    leaveParkhouse,
    getFacilitiesOfTenant
};