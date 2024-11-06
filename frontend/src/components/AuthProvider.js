import React, { useEffect, useState, createContext, useContext } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyDyrUu_sdx_C_E2iy9ZuMZX0W4KqMRa380",
  authDomain: "trabantparking-prod.firebaseapp.com",
  projectId: "trabantparking-prod",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create AuthContext
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [token, settoken] = useState(null);

  // Handle login with Google
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      settoken(result.token);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  // Monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currenttoken) => {
      settoken(currenttoken);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      settoken(null);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  // Provide the authentication state and functions to children
  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
