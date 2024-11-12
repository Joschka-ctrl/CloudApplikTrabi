// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/*
const firebaseConfig = {
  apiKey: "AIzaSyCHuN2pr0uFCBl1Ud8yQOo0yn0gWANAUuA",
  authDomain: "trabantparking.firebaseapp.com",
  projectId: "trabantparking",
};
*/

const app = initializeApp();

// Exportiere die Authentifizierungs-Instanz
export const auth = getAuth(app);
export default app;
