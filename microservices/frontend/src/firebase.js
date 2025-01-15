// src/firebase.js
import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey:"AIzaSyAxKX_3EoGfq5NJt5gNg_kFrwyU-70GqEo",
  authDomain: process.env.REACT_APP_PROJECT_ID + ".firebaseapp.com",
  projectId: process.env.REACT_APP_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to set tenant ID
export const setAuthTenant = (tenantId) => {
  if (tenantId) {
    auth.tenantId = tenantId;
  }
};

// Export the auth instance
export { auth };
export default app;
