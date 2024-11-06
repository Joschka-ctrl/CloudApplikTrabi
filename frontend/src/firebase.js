// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDyrUu_sdx_C_E2iy9ZuMZX0W4KqMRa380",
  authDomain: "trabantparking-prod.firebaseapp.com",
  projectId: "trabantparking-prod",
};

const app = initializeApp(firebaseConfig);

// Exportiere die Authentifizierungs-Instanz
export const auth = getAuth(app);
export default app;
