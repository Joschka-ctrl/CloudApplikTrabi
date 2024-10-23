// firestore.js
var admin = require("firebase-admin");

// Lade den privaten Schlüssel deines Service-Kontos
const serviceAccount = require('./cloud-eigl-firebase-adminsdk-5gdjf-15af4bd2c6.json');

// Initialisiere Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });


module.exports = admin.firestore();