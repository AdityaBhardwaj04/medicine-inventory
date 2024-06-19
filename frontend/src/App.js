import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminStock from './components/AdminStock';
import Billing from './components/Billing';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <Router>
        <div>
            <Navbar/>
            <div>
                <Routes>
                    <Route path="/" element={<HomePage/>} />
                    <Route path="/stock" element={<AdminStock/>} />
                    <Route path="/billing" element={<Billing/>} />
                    <Route path="/dashboard" element={<Dashboard/>} />
                </Routes>
            </div>
        </div>
    </Router>
  );
};

export default App;
