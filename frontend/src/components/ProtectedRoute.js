import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Laden...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;