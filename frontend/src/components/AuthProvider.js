import React, { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, setAuthTenant } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Restore tenantId from sessionStorage if it exists
      const storedTenantId = sessionStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
        setAuthTenant(storedTenantId);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password, tenantId) => {
    try {
      // Set the tenant ID before attempting to sign in
      setAuthTenant(tenantId);
      
      // Attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // Store tenantId in sessionStorage and state
      sessionStorage.setItem('tenantId', tenantId);
      setTenantId(tenantId);
    } catch (error) {
      console.error("Fehler beim Anmelden:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear tenantId from sessionStorage and state
      sessionStorage.removeItem('tenantId');
      setTenantId(null);
      setAuthTenant(null); // Clear the tenant ID from auth
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  };

  const value = {
    user,
    loading,
    tenantId,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;