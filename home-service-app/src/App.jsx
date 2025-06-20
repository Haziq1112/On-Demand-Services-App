import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Category from './pages/Category';
import Login from './pages/Login';
import ServiceDetail from './pages/ServiceDetail';
import ProviderDashboard from './pages/ProviderDashboard';
import AddServicePage from './pages/AddServicePage';
import ServiceFormWrapper from './components/ServiceFormWrapper';
import ProviderServiceFormPage from './pages/ProviderServiceFormPage';
import MyBookings from './pages/MyBookings';
import ProviderBookings from './pages/ProviderBookings';
import ProviderCategory from './pages/ProviderCategory';
import ProviderAllServices from './pages/ProviderAllServices';
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
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/services" element={<ProviderDashboard />} />
        <Route path="/provider/category/:name" element={<ProviderCategory />} />
        <Route path="/provider/services/add" element={<AddServicePage />} />
        <Route path="/provider/services/:serviceId/edit" element={<ServiceFormWrapper />} />
        <Route path="/provider/add-service" element={<ProviderServiceFormPage />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/provider/servicess" element={<ProviderAllServices />} />
      </Routes>
    </Router>
  );
};

export default App;
