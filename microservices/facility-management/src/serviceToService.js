const PARKING_SERVICE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3033' : 'http://trabant-app-backend-parking.default.svc.cluster.local/api/parking';


function sendNewFacility(facility, token) {
  const parkingFacility = {
    facilityId: facility.facilityId,
    tenantId: facility.tenantId,
    floors: facility.floors,
    pricePerMinute: facility.pricePerMinute,
    maxCapacity: facility.maxCapacity,
    name: facility.name,
  };

  console.log("Sending new facility to parking service: ", JSON.stringify(parkingFacility));
  console.log("Adress: ", `${PARKING_SERVICE_URL}/createParkingSpotsForFacility`);

  fetch(`${PARKING_SERVICE_URL}/createParkingSpotsForFacility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(parkingFacility),
  }).then((response) => {
    console.log(response);
    if (!response.ok) {
      console.log("Network response was not ok");
    }
  });
}

module.exports = { sendNewFacility };