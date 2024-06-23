import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Manage Stock</h5>
              <Link to="/stock" className="btn btn-primary">Go to Stock</Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Billing</h5>
              <Link to="/billing" className="btn btn-primary">Go to Billing</Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">View Sales</h5>
              <Link to="/sales" className="btn btn-primary">Go to Sales</Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Manage Users</h5>
              <Link to="/users" className="btn btn-primary">Go to Users</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;