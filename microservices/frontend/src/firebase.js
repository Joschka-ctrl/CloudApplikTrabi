// src/firebase.js
import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';


const firebaseConfig = {
  apiKey:"AIzaSyAxKX_3EoGfq5NJt5gNg_kFrwyU-70GqEo",
  authDomain: process.env.REACT_APP_PROJECT_ID + ".firebaseapp.com",
  projectId: process.env.REACT_APP_PROJECT_ID,
};


const app = initializeApp(firebaseConfig);

// Exportiere die Authentifizierungs-Instanz
export const auth = getAuth(app);
export default app;
