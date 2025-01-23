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
  const [currentTenantId, setCurrentTenantId] = useState(() => {
    return localStorage.getItem('currentTenantId');
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear tenant ID when user logs out
        localStorage.removeItem('currentTenantId');
        setCurrentTenantId(null);
      }
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
      localStorage.setItem('currentTenantId', tenantId);
      setCurrentTenantId(tenantId);
      const credentials = await signInWithEmailAndPassword(auth, email, password);

      const host = window.location.hostname;

      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
      const user = credentials.user;
      console.log("check users plan...");
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      const userplan = claims.plan;
      const isFreeTenant = host.startsWith('free') 
      const isProTenant = host.startsWith('pro');
      const enterpriseTenant = host.startsWith(tenantId);

      if (!enterpriseTenant && userplan === 'enterprise') {
        await handleLogout();
        throw new Error("You need a pro plan to use this tenant");
      }
      if (!isFreeTenant && userplan === 'free') {
        await handleLogout();
        throw new Error("You need a pro plan to use this tenant");
      }
      if (!isProTenant && userplan === 'pro') {
        await handleLogout();
        throw new Error("You need a free plan to use this tenant");
      }
    }
    } catch (error) {
      console.error("Fehler beim Anmelden:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('currentTenantId');
      setCurrentTenantId(null);
      window.location.reload();
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