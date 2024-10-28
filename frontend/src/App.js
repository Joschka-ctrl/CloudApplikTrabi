//import "./App.css";
import Navbar from "./components/Navbar.js";
import ContactSection from "./pages/Contact.js";
import Defects from "./pages/Defects";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<ContactSection />} />
            <Route path="/defects" element={<Defects />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;
