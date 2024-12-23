import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage">
      <div className="card">
        <h1>Welcome to ABM Campaign Manager</h1>
        <p>Select how you'd like to begin:</p>
        <div className="button-group">
          <Link to="/manual">
            <button className="button">Manual Entry</button>
          </Link>
          <Link to="/upload">
            <button className="button">Upload CSV</button>
          </Link>
          <Link to="/dashboard">
            <button className="button">View Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
