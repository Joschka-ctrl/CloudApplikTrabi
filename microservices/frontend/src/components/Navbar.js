import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "../Navbar.css";

const Navbar = () => {
  const { user, onLogout } = useAuth();
  const [customization, setCustomization] = useState({
    primaryColor: '#363636',  // default color
    secondaryColor: '#dc004e',
    logoUrl: ''
  });
  const currentHost = window.location.hostname;
  // Überprüfen, ob der Pfad mit "/free" beginnt
  const shouldShowReports = !currentHost.startsWith('free');
  console.log(shouldShowReports);

  // Check if this is a free or pro tenant
  const isBasicTenant = currentHost.startsWith('free') || currentHost.startsWith('pro');

  useEffect(() => {
    const getCustomClaims = async () => {
      // Don't fetch customization for free/pro tenants
      if (!user || isBasicTenant) return;
      
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      
      // Update customization if claims exist
      if (claims.primaryColor || claims.secondaryColor || claims.logoUrl) {
        setCustomization({
          primaryColor: claims.primaryColor || customization.primaryColor,
          secondaryColor: claims.secondaryColor || customization.secondaryColor,
          logoUrl: claims.logoUrl || customization.logoUrl
        });
      }
    };

    getCustomClaims();
  }, [user, isBasicTenant]);

  const navbarStyle = {
    backgroundColor: isBasicTenant ? '#363636' : customization.primaryColor,
  };

  return (
    <nav className="Navbar" style={navbarStyle}>
      <ul className="NavbarList">
        <li className="NavbarItem l">
          <Link to="/">Contact Section</Link>
        </li>
        <div className="VerticalDivider" />
        {user ? (
          <>
            <li className="NavbarItem r">
              <Link to="/defects">Defects</Link>
            </li>
            
            {/* {shouldShowReports && (
              <>
              <div className="VerticalDivider" />
              <li className="NavbarItem r">
                <Link to="/reports">Reports</Link>
              </li>
              </>)} */}
            
            <div className="VerticalDivider" />
            <li className="NavbarItem r">
              <Link to="/reports">Reports</Link>
            </li>
              
            <div className="VerticalDivider" />
            <li className="NavbarItem r">
              <Link to="/e-charging">E-Charging</Link>
            </li>
            <div className="VerticalDivider" />
            <li className="NavbarItem r">
              <Link to="/parkingSpaces">Parking</Link>
            </li>
            <div className="VerticalDivider" />
            <li className="NavbarItem r">
              <Link to="/facilities">Facilities</Link>
            </li>
            <div className="VerticalDivider" />
            <li className="NavbarItem r" style={{ cursor: "pointer", color: "white" }} onClick={onLogout}>
              Sign Out
            </li>
          </>
        ) : (
          <li className="NavbarItem r">
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
