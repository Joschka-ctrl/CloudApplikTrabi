import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../Navbar.css";

const Navbar = () => {
  return (
    <nav className="Navbar">
      <ul className="NavbarList">
        <li className="NavbarItem l">
          <Link to="/">Contact Section</Link>
        </li>
        <div className="VerticalDivider" />
        <li className="NavbarItem r">
          <Link to="/defects">Defects</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
