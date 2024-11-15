import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await onRegister(userCredential.user);
      navigate("/defects");
    } catch (err) {
      setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Registrieren</h2>
        <form onSubmit={handleRegister}>
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
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Passwort bestätigen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger text-center">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mb-3">Registrieren</button>
        </form>
        <button onClick={() => navigate("/login")} className="btn btn-outline-secondary w-100">
          Zurück zur Anmeldung
        </button>
      </div>
    </div>
  );
}

export default Register;
