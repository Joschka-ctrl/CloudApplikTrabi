// src/firebase.ts
import { initializeApp, FirebaseApp } from '@firebase/app';
import { getAuth, Auth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_AUTH_API_KEY,
  authDomain: `${import.meta.env.VITE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_PROJECT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);



// Exportiere die Authentifizierungs-Instanz
export const auth: Auth = getAuth(app);
export default app;
