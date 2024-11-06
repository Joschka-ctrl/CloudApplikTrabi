//import "./App.css";
import Navbar from "./components/Navbar.js";
import ContactSection from "./pages/Contact.js";
import Defects from "./pages/Defects";
import { BrowserRouter as Router, Route, Routes, redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/Login.js";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import Register from "./pages/Register.js";
import { Navigate } from 'react-router-dom';

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Protected Route Component
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Updated App component
return (
  <div className="App">
    <header className="App-header">
      <Router>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<ContactSection />} />
          <Route 
            path="/defects" 
            element={
              <ProtectedRoute user={user}>
                <Defects user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />
            }
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/" replace /> : <Register onRegister={setUser} />
            }
          />
        </Routes>
      </Router>
    </header>
  </div>
);
}

export default App;
