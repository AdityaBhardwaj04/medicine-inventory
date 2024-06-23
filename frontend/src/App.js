import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
// import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Stock from './components/AdminStock';
import Billing from './components/BillingPage';
import Sales from './components/Dashboard';
import Users from './components/Users';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*<Route path="/login" element={<Login />} />*/}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/users" element={<Users />} />
        <Route path="/" element={<HomePage/>} />
      </Routes>
    </Router>
  );
};

export default App;
