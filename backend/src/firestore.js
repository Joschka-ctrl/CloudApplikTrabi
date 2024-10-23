// firestore.js
var admin = require("firebase-admin");

// Lade den privaten Schlüssel deines Service-Kontos
const serviceAccount = require('../../../../secret/gauth.json');

// Initialisiere Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });


module.exports = admin.firestore();