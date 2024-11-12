import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ContactSection from "./pages/Contact";
import Defects from "./pages/Defects";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <header className="App-header">
            <Navbar />
            <Routes>
              <Route path="/" element={<ContactSection />} />
              <Route
                path="/defects"
                element={
                  <ProtectedRoute>
                    <Defects />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </header>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;