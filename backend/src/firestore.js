// firestore.js
var admin = require("firebase-admin");

// Initialisiere Firebase
admin.initializeApp({});

module.exports = admin.firestore();
