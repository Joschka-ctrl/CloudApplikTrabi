// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyCHuN2pr0uFCBl1Ud8yQOo0yn0gWANAUuA",
  authDomain: process.env.REACT_APP_PROJECT_ID + ".firebaseapp.com",
  projectId: process.env.REACT_APP_PROJECT_ID,
};


const app = initializeApp(firebaseConfig);

// Exportiere die Authentifizierungs-Instanz
export const auth = getAuth(app);
export default app;
