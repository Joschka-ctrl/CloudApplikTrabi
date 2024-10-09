import "./App.css";
import ContactSection from './pages/Contact.js';
import Defects from "./pages/Defects";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
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
