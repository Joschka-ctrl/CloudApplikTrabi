const { Timestamp } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});
console.log("Database:", process.env.CLUSTER_NAME || "develop");
admin.firestore().settings({ databaseId: process.env.CLUSTER_NAME || "develop" });
const db = admin.firestore()

// Parkhaus
let parkingSpots = [{ id: "1", occupied: false }, { id: "2", occupied: true }];


const createParkingSpotObject = (tenantId, facilityId, floors, pricePerMinute, maxCapacity) => {

    let floorsArray = [];
    for (let i = 0; i < floors.length; i++) {
        let floor = {
            floorNumber: i,
            spots: []
        }
        for (let j = 0; j < floors[i]; j++) {
            let spot = {
                id: `${i}${j + 1}`,
                occupied: false,
                isOnfloor: i,
                isClosed: false,
                avalibilityStatus: "free"
            }
            floor.spots.push(spot);
        }
        floorsArray.push(floor);
    }
    console.log(floorsArray);



    let erg = {
        tenantId: tenantId,
        facilityId: facilityId,
        parkingSpacesOnFloor: floorsArray,
        carsInParkingFacility: [],
        currentOccupancy: 0,
        maxCapacity: maxCapacity,
        pricePerMinute: pricePerMinute
    }
    console.log(erg);
    return erg;
};

const newParkingSpotsInFacility = async (newFacility) => {
    try {
        const docRef = await db.collection("parking-spaces").add(newFacility);
        const history = {
            facilityId: newFacility.facilityId,
            tenantId: newFacility.tenantId,
            History: []
        }
        const docRef1 = await db.collection("parking-history").add(history);
        console.log('Document written with ID: ', docRef1.id);
        docRef.FacilityID = newFacility.id;
        return docRef;
    } catch (error) {
        console.error('Error creating new parking spots:', error);
        throw new Error('Failed to create new parking spots.');
    }
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
    try {
        // Fetch the parking facility document
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
            throw new Error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
        }
        const doc = snapshot.docs[0];
        const facilityData = doc.data();
        return facilityData;
    } catch (error) {
        console.error('Error fetching facility data:', error);
        throw new Error('Failed to fetch facility data.');
    }
};

const getDoc = async (facilityID, tenantID) => {
    try {
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No facility found with ID: ${facilityID} and tenantId: ${tenantID}`);
        }

        const doc = snapshot.docs[0];
        console.log(doc.id);
        return doc;
    } catch (error) {
        console.error('Error fetching facility data:', error);
    }
}

const getParkingHistoryDoc = async (facilityID, tenantID) => {
    try {
        const snapshot = await db.collection("parking-history")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No History found for ID: ${facilityID} and tenantId: ${tenantID}`);
        }

        const doc = snapshot.docs[0];
        return doc;
    } catch (error) {
        console.error('Error fetching facility data:', error);
    }
}

const getAllParkingSpotsOfFacility = async (facilityID, tenantID) => {
    try {
        // Query the Firestore collection "parking-facility" for documents where tenantId matches
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
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
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
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

const createParkingSpot = async (facilityId, tenantId, floor) => {
    console.log('Create Parking Spot');
    try {
        const facility = await getFacilityData(facilityId, tenantId);
        console.log(facility);
        const newSpot = {
            id: `${floor}${facility.parkingSpacesOnFloor[floor].spots.length + 1}`,
            occupied: false,
            isOnfloor: floor
        };
        console.log(newSpot);
        facility.parkingSpacesOnFloor[floor].spots.push(newSpot);
        const doc = await getDoc(facilityId, tenantId);
        await db.collection("parking-spaces").doc(doc.id).update({
            parkingSpacesOnFloor: facility.parkingSpacesOnFloor
        });
        return newSpot;

    } catch (error) {
        console.error('Error fetching facility data:', error);
        throw new Error('Failed to fetch facility data.');
    }
};

const addCarToParkingFacility = async (facilityID, tenantID, ticketNumber) => {
    try {
        // Fetch the parking facility document
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No object found with ID: ${facilityID} and tenantId: ${tenantID}`);
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
        await db.collection("parking-spaces").doc(doc.id).update({
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
        await db.collection("parking-spaces").doc(docID).update({
            carsInParkingFacility: facility.carsInParkingFacility
        });

        return facility.carsInParkingFacility[carIndex];
    } catch (error) {
        console.error('Error updating car parking ended at:', error);
        throw new Error('Failed to update car parking ended at.');
    }
};

const updateCarPayedAt = async (ticketNumber, payedAt, facilityID, tenantID) => {
    try {
        const facility = await getFacilityData(facilityID, tenantID); // bekommt das facility object
        const car = getCarFromParkingFacility(ticketNumber, facility); // bekommt das car object
        if (!car || car.parkingEndedAt) {
            console.error('Car with this ticket number not found or already left the parking facility');
        }
        car.payedAt.push(payedAt);
        console.log(car.payedAt);
        // update car in parking facility in DB 

        const doc = await getDoc(facilityID, tenantID);
        console.log(doc.id);
        await db.collection("parking-spaces").doc(doc.id).update({
            carsInParkingFacility: facility.carsInParkingFacility
        });
        console.log(car.payedAt.length);
        return car;
    }
    catch (error) {
        console.error('Error updating car payed at:', error);
        throw new Error('Failed to update car payed at.');
    }
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
        const snapshot = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No Entries found with ID: ${facilityID} and tenantId: ${tenantID}`);
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
            await db.collection("parking-spaces").doc(doc.id).update({
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
        const facilityData = await getFacilityData(facilityID, tenantID);
        const { currentOccupancy, maxCapacity } = facilityData;
        return { "currentOccupancy": currentOccupancy, "maxCapacity": maxCapacity };
    }
    catch (error) {
        console.error('Error fetching current occupancy:', error);
        return { error: 'Failed to fetch current occupancy.' };
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
                    throw new Error(`Parking spot ${spotID} is already ${newStatus ? 'occupied' : 'free'}`);
                }
                spot.occupied = newStatus;
                spot.avalibilityStatus = newStatus ? 'occupied' : 'free';
                spotFound = true;
            }
        });
        if (!spotFound) {
            console.error(`Parking spot with ID ${spotID} not found`);
            return { success: false, message: `Parking spot with ID ${spotID} not found` };
        }
        const doc = await getDoc(facilityID, tenantID);
        console.log(doc.id);
        // Update Firestore with the new occupancy status
        await db.collection("parking-spaces").doc(doc.id).update({
            parkingSpacesOnFloor: facilityData.parkingSpacesOnFloor
        });

        console.log(`Successfully updated parking spot ${spotID} to status: ${newStatus}`);
        return { success: true, spotID, status: "updated" };
    } catch (error) {
        console.error('Error managing parking spot occupancy:', error);
        return { success: false, message: 'Failed to update parking spot occupancy.', error: error.message };
    }
};

const reverseOccupancy = async (tenantID, facilityID, spotID) => {
    console.log("reverse Parking Spot Occupancy");
    try {
        const doc = await getDoc(facilityID, tenantID);
        const facilityData = doc.data();
        // Locate the parking spot
        let spotFound = false;
        facilityData.parkingSpacesOnFloor.forEach(floor => {
            const spot = floor.spots.find(s => s.id === spotID);
            if (spot) {
                spot.occupied = !spot.occupied;
                spotFound = true;
            }
        });
        if (!spotFound) {
            console.error(`Parking spot with ID ${spotID} not found`);
            throw new Error(`Parking spot with ID ${spotID} not found`);
        }

        // Update Firestore with the new occupancy status
        await db.collection("parking-spaces").doc(doc.id).update({
            parkingSpacesOnFloor: facilityData.parkingSpacesOnFloor
        });

        console.log(`Successfully updated parking spot ${spotID} to status:`);
        return { success: true, spotID };
    } catch (error) {
        console.error('Error managing parking spot occupancy:', error);
        throw new Error('Failed to update parking spot occupancy.');
    }
};

/**
 * handle handleSpotAvalibilityStatus
 * 
 */
const handleSpotAvalibilityStatus = async (tenantID, facilityID, spotID, shouldBeClosed, shouldBeOccupied) => {
    console.log("handleSpotAvalibilityStatus");
    try {


        // update DB Parking-Spaces


        const doc = await getDoc(facilityID, tenantID);
        const facilityData = doc.data();
        console.log(facilityData);

        // Locate the parking spot
        let spotFound = false;
        facilityData.parkingSpacesOnFloor.forEach(floor => {
            const spot = floor.spots.find(s => s.id === spotID);
            if (spot) {

                const currentState = {
                    isClosed: spot.isClosed,
                    occupied: spot.occupied,
                };

                switch (true) {
                    case (!currentState.isClosed && shouldBeClosed):
                        // Case: Der Parkplatz wird geschlossen
                        spot.occupied = false;
                        spot.isClosed = true;
                        spot.avalibilityStatus = "closed"; // Parkplatz nicht verfügbar
                        facilityData.maxCapacity -= 1; // Kapazität reduzieren
                        console.log(`Spot ${spot.id} wurde geschlossen.`);
                        break;
                    case (currentState.isClosed && shouldBeClosed):
                        // Case: Parkplatz bleibt geschlossen
                        console.log(`Spot ${spot.id} bleibt geschlossen.`);
                        break;
                    case (currentState.isClosed && !shouldBeClosed):
                        // Case: Parkplatz wird freigegeben
                        spot.occupied = false;
                        spot.isClosed = false;
                        spot.avalibilityStatus = "free"; // Parkplatz verfügbar
                        facilityData.maxCapacity += 1; // Kapazität erhöhen
                        console.log(`Spot ${spot.id} wurde freigegeben.`);
                        break;
                    case (!currentState.isClosed && !shouldBeClosed && shouldBeOccupied):
                        // Case: Parkplatz wird besetzt
                        spot.occupied = true;
                        spot.isClosed = false;
                        spot.avalibilityStatus = "occupied"; // Parkplatz nicht verfügbar
                        console.log(`Spot ${spot.id} wurde besetzt.`);
                        break;
                    case (!currentState.isClosed && !shouldBeClosed && !shouldBeOccupied):
                        // Case: Parkplatz ist frei
                        spot.occupied = false;
                        spot.avalibilityStatus = "free"; // Parkplatz verfügbar
                        console.log(`Spot ${spot.id} ist frei.`);
                        break;
                    case (currentState.isClosed && !shouldBeClosed && shouldBeOccupied):
                        // Case: Parkplatz bleibt geschlossen
                        console.log(`Spot ${spot.id} bleibt geschlossen.`);
                        break;
                    case (currentState.isClosed && shouldBeClosed):
                        // Case: Parkplatz bleibt geschlossen
                        console.log(`Spot ${spot.id} bleibt geschlossen.`);
                        break;



                    default:
                        console.error(`Unerwarteter Zustand für Spot ${spot.id}`);
                }

                spotFound = true;
            }
        });
        if (!spotFound) {
            console.error(`Parking spot with ID ${spotID} not found`);
            throw new Error(`Parking spot with ID ${spotID} not found`);
        }

        console.log(doc.id);
        // Update Firestore with the new isClosed status
        await db.collection("parking-spaces").doc(doc.id).update({
            parkingSpacesOnFloor: facilityData.parkingSpacesOnFloor,
            maxCapacity: facilityData.maxCapacity
        });

        console.log(`Successfully updated parking spot ${spotID}`);
        return { success: true, spotID };
    } catch (error) {
        console.error('Error managing parking spot closure status:', error);
        throw new Error('Failed to update parking spot closure status.');
    }
};

const handleSpotAvalibilityStatusByStatusName = async (tenantID, facilityID, spotID, newStatus) => {
    console.log("handleSpotAvalibilityStatus");
    try {
        // update DB Parking-Spaces
        const doc = await getDoc(facilityID, tenantID);
        const facilityData = doc.data();
        console.log(facilityData);

        // Locate the parking spot
        let spotFound = false;
        facilityData.parkingSpacesOnFloor.forEach(floor => {
            const spot = floor.spots.find(s => s.id === spotID);
            if (spot) {
                switch (true) {
                    case (newStatus === "closed"):
                        // Case: Der Parkplatz wird geschlossen
                        if (!spot.isClosed) {
                            facilityData.maxCapacity -= 1; // Kapazität reduzieren
                        }
                        spot.occupied = false;
                        spot.isClosed = true;
                        spot.avalibilityStatus = "closed"; // Parkplatz nicht verfügbar
                        console.log(`Spot ${spot.id} wurde geschlossen.`);
                        break;

                    case (newStatus === "free"):
                        // Case: Parkplatz wird freigegeben
                        if (spot.isClosed) {
                            facilityData.maxCapacity += 1; // Kapazität reduzieren
                        }
                        spot.occupied = false;
                        spot.isClosed = false;
                        spot.avalibilityStatus = "free"; // Parkplatz verfügbar
                        console.log(`Spot ${spot.id} wurde freigegeben.`);
                        break;
                    case (newStatus === "occupied"):
                        // Case: Parkplatz wird besetzt
                        if (spot.isClosed) {
                            facilityData.maxCapacity += 1; // Kapazität reduzieren
                        }
                        spot.occupied = true;
                        spot.isClosed = false;
                        spot.avalibilityStatus = "occupied"; // Parkplatz nicht verfügbar
                        console.log(`Spot ${spot.id} wurde besetzt.`);
                        break;
                    default:
                        console.error(`Unerwarteter Zustand für Spot ${spot.id}`);
                }

                spotFound = true;
            }
        });
        if (!spotFound) {
            console.error(`Parking spot with ID ${spotID} not found`);
            throw new Error(`Parking spot with ID ${spotID} not found`);
        }

        console.log(doc.id);
        // Update Firestore with the new isClosed status
        await db.collection("parking-spaces").doc(doc.id).update({
            parkingSpacesOnFloor: facilityData.parkingSpacesOnFloor,
            maxCapacity: facilityData.maxCapacity
        });

        console.log(`Successfully updated parking spot ${spotID}`);
        return { success: true, spotID };
    } catch (error) {
        console.error('Error managing parking spot closure status:', error);
        throw new Error('Failed to update parking spot closure status.');
    }
};

const getCarFromParkingFacility = (ticketNumber, facilityData) => {

    // Find the car in the carsInParkingFacility array
    const car = facilityData.carsInParkingFacility.find(c => c.ticketNumber === ticketNumber);
    if (!car) {
        throw new Error(`Car with ticket number ${ticketNumber} not found in facility ${facilityData.facilityId}`);
    }
    return car;
};

const getParkingDurationREST = async (ticketNumber, tenantID, facilityID) => {
    try {
        const facility = await getFacilityData(facilityID, tenantID);
        const minutes = await getParkingDuration(ticketNumber, facility);
        return minutes;
    } catch (error) {
        console.error('Error fetching parking duration:', error);
        console.error('Failed to fetch parking duration.');
    }
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
    try {
        const car = getCarFromParkingFacility(ticketNumber, facility);
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
    } catch (error) {
        console.error('Error fetching parking duration:', error);
    }
};

const getMinutesInMillis = (minutes) => {
    return minutes * 60 * 1000;
}

const getParkingFeeRest = async (ticketNumber, tenantID, facilityID) => {
    try {
        const facility = await getFacilityData(facilityID, tenantID);
        const fee = await getParkingFee(ticketNumber, facility);
        return fee;
    } catch (error) {
        console.error('Error fetching parking fee:', error);
        console.error('Failed to fetch parking fee.');
    }
};
const getParkingFee = async (ticketNumber, facility) => {
    try {
        const car = getCarFromParkingFacility(ticketNumber, facility);
        if (!car || car.parkingEndedAt) {
            console.error('Car with this ticket number not found or already left the parking facility');
        }
        const parkingDurationInMinutes = await getParkingDuration(ticketNumber, facility);
        console.log("Parking Duration: " + parkingDurationInMinutes);
        const pricing = facility.pricePerMinute;
        console.log("Pricing: " + pricing);
        const fee = pricing * parkingDurationInMinutes;
        return fee;
    } catch (error) {
        console.error('Error fetching parking fee:', error);
        console.error('Failed to fetch parking fee.');
    }
};

const payParkingFee = async (ticketNumber, tenantID, facilityID) => {
    try {
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
    } catch (error) {
        console.error('Error processing payment:', error);
        throw new Error('Failed to process payment.');
    }
};

const mockPaymentService = (fee) => {
    return true;
};

const leaveParkhouse = async (ticketNumber, tenantID, facilityID) => {

    try {
        console.log("Leave Parkhouse");

        // Holen der Facility-Daten aus Firestore
        const facilityDoc = await db.collection("parking-spaces")
            .where("facilityId", "==", facilityID)
            .where("tenantId", "==", tenantID)
            .get();

        if (facilityDoc.empty) {
            throw new Error('Facility not found for the given tenant and facility ID.');
        }

        const facility = facilityDoc.docs[0].data();
        const docID = facilityDoc.docs[0].id;

        // Finden des Autos in der Facility
        const carIndex = facility.carsInParkingFacility.findIndex(
            c => c.ticketNumber === ticketNumber
        );

        if (carIndex === -1 || facility.carsInParkingFacility[carIndex].parkingEndedAt) {
            console.error('Car with this ticket number not found or already left the parking facility.');
            return { error: 'Car with this ticket number not found or already left the parking facility.' };
        }

        const car = facility.carsInParkingFacility[carIndex];

        // Prüfen, ob die Zahlung abgeschlossen ist und die Parkdauer abgelaufen ist
        if (car.payedAt.length > 0 && await getParkingDuration(ticketNumber, facility) === 0) {
            // Holen der aktuellen Zeit für `parkingEndedAt`
            const parkingEndedAt = Timestamp.now();

            // Holen der Autodaten und Aktualisierung des Zeitstempels
            const carData = { ...car, parkingEndedAt };

            // Prüfen, ob es bereits einen Eintrag für die `facilityId` und `tenantId` in `Parking-history` gibt
            const historyDoc = await db.collection("parking-history")
                .where("facilityId", "==", facilityID)
                .where("tenantId", "==", tenantID)
                .limit(1)
                .get();

            if (historyDoc.empty) {
                // Wenn kein Eintrag existiert, wird ein neues Dokument erstellt
                await db.collection("parking-history").add({
                    facilityId: facilityID,
                    tenantId: tenantID,
                    History: [carData] // Erstes Auto wird hinzugefügt
                });
            } else {
                // Wenn ein Eintrag existiert, wird das Auto zur `History[]` hinzugefügt
                const history = historyDoc.docs[0];
                const historyData = history.data();

                await db.collection("parking-history").doc(history.id).update({
                    History: [...historyData.History, carData]
                });
            }

            // Entfernen des Autos aus der aktuellen Tabelle und anpasssen der Occupancy
            const updatedCars = facility.carsInParkingFacility.filter(c => c.ticketNumber !== ticketNumber);
            const updatedOccupancy = Math.max(0, facility.currentOccupancy - 1); // Sicherstellen, dass Occupancy nicht negativ wird

            await db.collection("parking-spaces").doc(docID).update({
                carsInParkingFacility: updatedCars,
                currentOccupancy: updatedOccupancy
            });

            return { success: true, movedCar: carData };
        } else {
            return { error: 'Payment not completed or parking duration is not zero.' };
        }
    } catch (error) {
        console.error('Error leaving parking facility:', error);
        return {
            success: false,
            error: 'Failed to leave parking facility.',
            details: error.message
        };
    }
};



// funktionen für Reports
const getFacilitiesOfTenant = async (tenantID) => {
    try {
        const snapshot = await db.collection("parking-spaces")
            .where("tenantId", "==", tenantID)
            .get();

        if (snapshot.empty) {
            console.error(`No facilities found for tenant with ID: ${tenantID}`);
        }

        const facilities = [];
        snapshot.forEach(doc => {
            const facilityData = doc.data();
            facilities.push(facilityData);
        });
        return facilities;
    } catch (error) {
        console.error('Error fetching facilities:', error);
        throw new Error('Failed to fetch facilities.');
    }
};

const getParkingStats = async (tenantId, facilityId, startDate, endDate) => {
    try {

        const facilityDoc = await getParkingHistoryDoc(facilityId, tenantId);
        const facility = facilityDoc.data();
        // Berechnung der Statistiken
        const stats = calculateParkingStats(facility, startDate, endDate);
        return ({ dailyUsage: stats });
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }


};

const calculateParkingStats = (facility, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Initiale Statistiken
    const dailyStats = {};

    facility.History.forEach(car => {
        const parkingDate = new Date(car.parkingStartedAt.seconds * 1000);
        if (parkingDate >= start && parkingDate <= end) {
            const dateKey = parkingDate.toISOString().split('T')[0];

            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = {
                    date: dateKey,
                    totalVehicles: 0,
                    occupancyPercentage: 0,
                    entries: 0,
                    exits: 0
                };
            }
            dailyStats[dateKey].totalVehicles += 1;
            dailyStats[dateKey].entries += 1;

            if (car.parkingEndedAt) {
                const exitDate = new Date(car.parkingEndedAt.seconds * 1000).toISOString().split('T')[0];
                if (dailyStats[exitDate]) {
                    dailyStats[exitDate].exits += 1;
                }
            }
        }
    });

    // Berechnung der Belegungsprozentzahl
    for (const key in dailyStats) {
        const stat = dailyStats[key];
        stat.occupancyPercentage = ((stat.totalVehicles / facility.maxCapacity) * 100).toFixed(2);
    }
    return Object.values(dailyStats);
};

const getFloorStats = async (tenantId, facilityId) => {
    try {
        // Facility-Daten abrufen
        const facility = await getFacilityData(facilityId, tenantId);

        // Initialisierung der Ergebnisse
        const floorStats = facility.parkingSpacesOnFloor.map((floor, index) => {
            const totalSpots = floor.spots.length - floor.spots.filter(spot => spot.isClosed).length;
            const occupiedSpots = floor.spots.filter(spot => spot.occupied).length;
            const occupancyPercentage = Math.ceil((occupiedSpots / totalSpots) * 100);
            const closedSpots = floor.spots.filter(spot => spot.isClosed).length;
            return {
                floor: index,
                totalSpots,
                occupiedSpots,
                closedSpots: closedSpots,
                availibleSpots: totalSpots - occupiedSpots - closedSpots,
                occupancyPercentage,
            };
        });
        return floorStats;
    } catch (error) {
        console.error('Fehler beim Abrufen der Floor-Stats:', error);
        throw new Error('Fehler beim Abrufen der Daten');
    }
};

const calculateAverageParkingDuration = (cars, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filtere Autos, die innerhalb des Zeitraums geparkt wurden
    const relevantCars = cars.filter(car => {
        try {
            if (!car.parkingStartedAt) throw new Error('No parking start date');

            const parkingStart = new Date(car.parkingStartedAt.toDate()); // Falls `toDate()` verfügbar ist
            const parkingEnd = car.parkingEndedAt
                ? new Date(car.parkingEndedAt.toDate()) // Falls `toDate()` verfügbar ist
                : new Date(); // Falls noch geparkt, setze aktuelles Datum

            return parkingStart <= end && parkingEnd >= start;
        } catch (error) {
            console.error(`Fehler beim Parsen des Datums für Ticket ${car.ticketNumber}:`, error);
            return false; // Wenn das Datum nicht korrekt geparst werden kann, wird das Auto ignoriert
        }
    });

    // Gesamtzeit berechnen
    const totalOccupancyTime = relevantCars.reduce((total, car) => {
        const parkingStart = new Date(car.parkingStartedAt.toDate());
        const parkingEnd = car.parkingEndedAt
            ? new Date(car.parkingEndedAt.toDate())
            : new Date();
        const overlapStart = parkingStart > start ? parkingStart : start;
        const overlapEnd = parkingEnd < end ? parkingEnd : end;

        return total + (overlapEnd - overlapStart);
    }, 0);

    // Durchschnittliche Zeit in Minuten
    return relevantCars.length ? totalOccupancyTime / relevantCars.length / (60 * 1000) : 0;
};

// Funktion zur Erstellung von Parkplatzdauer-Statistiken
const getParkingDurationStats = async (tenantId, facilityId, startDate, endDate) => {
    console.log('Get Parking Duration Stats');
    try {
        const facility = await getFacilityData(facilityId, tenantId);
        const histoyDoc = await getParkingHistoryDoc(facilityId, tenantId);
        history = histoyDoc.data();
        const averageDuration = calculateAverageParkingDuration(history.History, startDate, endDate);
        console.log(averageDuration);
        // Dauerunterteilungen
        const durationBreakdown = {
            shortTerm: history.History.filter(car => {
                const parkingDuration = calculateAverageParkingDuration([car], startDate, endDate);
                return parkingDuration < 2 * 60;
            }).length,
            mediumTerm: history.History.filter(car => {
                const parkingDuration = calculateAverageParkingDuration([car], startDate, endDate);
                return parkingDuration >= 2 * 60 && parkingDuration <= 6 * 60;
            }).length,
            longTerm: history.History.filter(car => {
                const parkingDuration = calculateAverageParkingDuration([car], startDate, endDate);
                return parkingDuration > 6 * 60;
            }).length
        };
        console.log(durationBreakdown);

        return {
            averageDuration,
            totalVehicles: facility.carsInParkingFacility.length,
            durationBreakdown
        };
    } catch (error) {
        console.error('Fehler beim Abrufen der Parkplatzdauer-Statistiken:', error);
        throw new Error('Fehler beim Abrufen der Daten');
    }
};

//geht noch nciht
const getRevenueStats = async (tenantId, facilityId, startDate, endDate) => {
    try {
        const facility = await getFacilityData(facilityId, tenantId);

        // Umsatz-Statistiken berechnen
        const dailyRevenue = facility.carsInParkingFacility.reduce((stats, car) => {
            try {
                const parkingStart = car.parkingStartedAt.toDate(); // Datum zurückgeben
                const parkingEnd = car.parkingEndedAt ? car.parkingEndedAt.toDate() : new Date(); // Falls noch geparkt, aktuelles Datum

                if (parkingStart >= startDate && parkingEnd <= endDate) {
                    const parkingDuration = (parkingEnd - parkingStart) / (60 * 1000); // In Minuten

                    const parkingDate = parkingEnd < endDate ? parkingEnd : new Date(endDate);
                    const formattedDate = parkingDate.toISOString().split('T')[0];

                    const existingDate = stats.find(stat => stat.date === formattedDate);
                    if (existingDate) {
                        existingDate.amount += parkingDuration; // Umsatz basierend auf der Dauer
                        existingDate.transactions += 1;
                    } else {
                        stats.push({
                            date: formattedDate,
                            amount: parkingDuration,
                            transactions: 1
                        });
                    }
                }
            } catch (error) {
                console.error(`Fehler beim Verarbeiten von Ticket ${car.ticketNumber}:`, error);
            }
            return stats;
        }, []);

        const totalRevenue = dailyRevenue.reduce((sum, stat) => sum + stat.amount, 0);

        return {
            totalRevenue,
            dailyRevenue
        };
    } catch (error) {
        console.error('Fehler beim Abrufen der Umsatz-Statistiken:', error);
        throw new Error('Fehler beim Abrufen der Daten');
    }
};


module.exports = {
    newParkingSpotsInFacility,
    createParkingSpotObject,
    getAllParkingSpotsOfFacility,
    getParkingSpotById,
    createParkingSpot,
    getTicketNumber,
    getCurrentOccupancy,
    getParkingDurationREST,
    manageParkingSpotOccupancy,
    reverseOccupancy,
    handleSpotAvalibilityStatus,
    handleSpotAvalibilityStatusByStatusName,
    getParkingFeeRest,
    payParkingFee,
    leaveParkhouse,
    getFacilitiesOfTenant,
    getParkingStats,
    getFloorStats,
    getParkingDurationStats,
    getRevenueStats
};