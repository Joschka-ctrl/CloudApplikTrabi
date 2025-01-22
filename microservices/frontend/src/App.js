import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ContactSection from "./pages/Contact";
import Defects from "./pages/Defects";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ECharging from "./features/echarging/pages/ECharging";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";
import ParkingLots from "./features/parkingmangement/pages/parkingLots";
import CreateFacility from "./features/Facilities/CreateFacility";
import Facilities from "./features/Facilities/Facilities";
import FacilityDetail from "./features/Facilities/Facility";


const App = () => {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <header className="App-header">
            <Navbar />
            <Routes>
              <Route path="/" element={<ContactSection />} />
              {/* <Route
                path="/defects"
                element={
                  <ProtectedRoute>
                    <Defects />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/defects/:facilityID"
                element={
                  <ProtectedRoute>
                    <Defects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/e-charging"
                element={
                  <ProtectedRoute>
                    <ECharging />
                  </ProtectedRoute>
                }
              />
                <Route
                path="/parkingSpaces"
                element={
                  <ProtectedRoute>
                    <ParkingLots/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parkingSpaces/:id"
                element={
                  <ProtectedRoute>
                    <ParkingLots/>
                  </ProtectedRoute>
                }
              />
              <Route path="/facilities" element={<ProtectedRoute><Facilities/></ProtectedRoute>} />
              <Route path="/facilities/new" element={<ProtectedRoute><CreateFacility/></ProtectedRoute>} />
              <Route path="/facilities/:id" element={<ProtectedRoute><FacilityDetail /></ProtectedRoute>} />
              <Route path="/facilities/:id/edit" element={<ProtectedRoute><CreateFacility edit /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </header>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;