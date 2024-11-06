//import "./App.css";
import Navbar from "./components/Navbar.js";
import ContactSection from "./pages/Contact.js";
import Defects from "./pages/Defects";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthProvider from "./components/AuthProvider.js";
import Login from "./pages/Login.js";

const App = () => {
  return (
    <Router>
    <AuthProvider>
      <header className="App-header">
          <Navbar />
          <Routes>
            <Route path="/" element={<ContactSection />} />
            <Route path="/defects" element={<Defects />} />
            <Route path="/login" element={<Login />} />
          </Routes>
      </header>
    </AuthProvider>
    </Router>
  );
};

export default App;
