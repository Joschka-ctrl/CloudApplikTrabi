import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
      navigate("/defects");
    } catch (err) {
      setError("Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.");
    }
  };

  return (
    <div>
      <h2>Anmelden</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Anmelden</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;