// firestore.js
var admin = require("firebase-admin");

// Initialize Firebase with application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

module.exports = admin.firestore();
