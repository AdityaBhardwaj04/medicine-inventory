import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">MedInventory</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin">Admin Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stock">Stock</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/billing">Billing</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sales">Sales</Link>
            </li>
            {/* Add more nav links here if needed */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
