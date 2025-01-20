import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState(null);
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!tenantId.trim()) {
      setError("Bitte geben Sie eine Tenant ID ein.");
      return;
    }

    try {
      await onLogin(email, password, tenantId.trim());
      navigate("/defects");
    } catch (err) {
      if (err.message === "Tenant ID is required") {
        setError("Bitte geben Sie eine gültige Tenant ID ein.");
      } else {
        setError("Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Anmelden</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tenant ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Anmelden
          </button>
        </form>
        <button onClick={() => navigate("/register")} className="btn btn-outline-secondary w-100">
          Registrieren
        </button>
      </div>
    </div>
  );
};

export default Login;