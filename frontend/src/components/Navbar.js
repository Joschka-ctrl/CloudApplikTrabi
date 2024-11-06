import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../Navbar.css";

const Navbar = ({user, onLogout}) => {
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
        <li className="NavbarItem r">
        <button type="button" onClick={onLogout}>
          Sign Out
        </button>
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
