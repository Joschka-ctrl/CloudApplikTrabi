// firestore.js
var admin = require("firebase-admin");

// Initialisiere Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

module.exports = admin.firestore();
