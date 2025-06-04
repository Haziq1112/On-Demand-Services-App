import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Category from './pages/Category';
import Login from './pages/Login';
import ServiceDetail from './pages/ServiceDetail';
import ProviderDashboard from './pages/ProviderDashboard';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/admin" element={<div className="p-4">Admin Dashboard</div>} />
        <Route path="/profile" element={<div className="p-4">My Profile Page</div>} />
        <Route path="/bookings" element={<div className="p-4">My Bookings Page</div>} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
