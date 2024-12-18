import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "../Navbar.css";

const Navbar = () => {
  const { user, onLogout } = useAuth();
  return (
    <nav className="Navbar">
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
