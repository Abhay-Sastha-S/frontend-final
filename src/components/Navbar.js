import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ toggleDarkMode, darkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Campaign Manager</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/manual">Manual Entry</Link>
        <Link to="/upload">Upload CSV</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/generate">Generate Campaign</Link>
      </div>
    </nav>
  );
}

export default Navbar;
