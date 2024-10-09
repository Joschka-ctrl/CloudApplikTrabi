import "./App.css";
import ContactSection from './pages/Contact.js';
import Defects from "./pages/Defects";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Defects />
        <div className="App">
            <h1>Willkommen zur Kontaktseite</h1>
            <ContactSection />
        </div>
      </header>
    </div>
  );
}

export default App;
