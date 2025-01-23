import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from "@mui/material";
import "../Navbar.css";

const Navbar = () => {
  const { user, onLogout, currentTenantId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [customization, setCustomization] = useState({
    primaryColor: '#363636',
    secondaryColor: '#dc004e',
    logoUrl: '',
    tenantName: ''
  });

  const currentHost = window.location.hostname;
  
  // Check if this is a free or pro tenant
  const isBasicTenant = currentHost.startsWith('free') || currentHost.startsWith('professional');
  const shouldShowReports = !isBasicTenant;

  useEffect(() => {
    const getCustomClaims = async () => {
      // Don't fetch customization for free/pro tenants
      if (!user || isBasicTenant) return;
      
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      if (claims.primaryColor || claims.secondaryColor || claims.logoUrl || claims.tenantId) {
        console.log('Custom claims:', claims);
        setCustomization({
          primaryColor: claims.primaryColor || customization.primaryColor,
          secondaryColor: claims.secondaryColor || customization.secondaryColor,
          logoUrl: claims.logoUrl || customization.logoUrl,
          tenantName: claims.tenantId || currentTenantId || 'Unknown Tenant'
        });
        // Reset logo error state when new URL is set
        setLogoError(false);
      }
    };

    getCustomClaims();
  }, [user, isBasicTenant, currentTenantId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.Navbar')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const backgroundColor = isBasicTenant ? '#363636' : customization.primaryColor;

  const navbarStyle = {
    backgroundColor,
  };

  const mobileMenuStyle = {
    backgroundColor,
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    onLogout();
  };

  const handleLogoError = () => {
    setLogoError(true);
    console.error('Failed to load logo from URL:', customization.logoUrl);
  };

  const navLinks = user ? (
    <>
      <li className="NavbarItem">
        <Link to="/defects" onClick={closeMenu}>Defects</Link>
      </li>
      <li className="NavbarItem" style={{ display: shouldShowReports ? 'block' : 'none' }}>
        <Link to="/reports" onClick={closeMenu}>Reports</Link>
      </li>
      <li className="NavbarItem">
        <Link to="/e-charging" onClick={closeMenu}>E-Charging</Link>
      </li>
      <li className="NavbarItem">
        <Link to="/parkingSpaces" onClick={closeMenu}>Parking</Link>
      </li>
      <li className="NavbarItem">
        <Link to="/facilities" onClick={closeMenu}>Parkhäuser</Link>
      </li>
      <li className="NavbarItem">
        <button className="sign-out-button" onClick={handleLogout}>
          Sign Out
        </button>
      </li>
    </>
  ) : (
    <li className="NavbarItem">
      <Link to="/login" onClick={closeMenu}>Login</Link>
    </li>
  );

  return (
    <nav className="Navbar" style={navbarStyle}>
      <Link to="/" className="logo" onClick={closeMenu}>
        {customization.logoUrl && !logoError ? (
          <img 
            src={customization.logoUrl} 
            alt={`${customization.tenantName} Logo`}
            onError={handleLogoError}
          />
        ) : (
          <span>{customization.tenantName}</span>
        )}
      </Link>

      <div className="menu-icon">
        <IconButton
          onClick={toggleMenu}
          sx={{ color: 'white' }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </div>

      <ul className={`NavbarList ${isMenuOpen ? 'active' : ''}`} style={mobileMenuStyle}>
        {navLinks}
      </ul>
    </nav>
  );
};

export default Navbar;
