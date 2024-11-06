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

  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<ContactSection />} />
          <Route path="/defects" element={<Defects user={user ? user : null} />} />
            <Route path="/login" element={<Login onLogin={setUser} />}></Route>
            <Route path="/register" element={<Register onRegister={setUser} />}></Route>
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;
