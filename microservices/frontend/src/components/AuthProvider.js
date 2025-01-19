import React, { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth, setAuthTenant } from "../firebase"; // Stellen Sie sicher, dass der Pfad korrekt ist

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTenantId, setCurrentTenantId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Aufräumen des Listeners bei Komponentendemontage
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password, tenantId) => {
    try {
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      setAuthTenant(tenantId);
      setCurrentTenantId(tenantId);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Fehler beim Anmelden:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTenantId(null);
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    currentTenantId,
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