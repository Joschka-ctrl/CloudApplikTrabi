// firestore.js
var admin = require("firebase-admin");

// Initialize Firebase with application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault() 
});
admin.firestore().settings({
  databaseId: process.env.CLUSTER_NAME || "develop",
});
 
module.exports = admin.firestore();
