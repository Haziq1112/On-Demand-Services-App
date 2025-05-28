import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get('/services/');
      setServices(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };

  const handleSearch = () => {
    const results = services.filter(service =>
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(results);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-green-700 text-white text-center py-3 text-2xl font-semibold shadow">
        On-Demand Service Platform
      </header>

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white shadow px-6 py-3">
        <div className="space-x-4">
          <Link to="/user-dashboard" className="hover:text-green-600">Home</Link>
          <a href="#services" className="hover:text-green-600">Our Services</a>
          <a href="#about" className="hover:text-green-600">About Us</a>
          <a href="#contact" className="hover:text-green-600">Contact</a>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/provider-register')}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Switch to Provider
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Slogan */}
      <section className="text-center py-6 bg-green-100 text-xl font-medium">
        "Connecting you with the best local service providers in one click!"
      </section>

      {/* Search Bar */}
      <section className="flex justify-center py-4 bg-white shadow-sm">
        <input
          type="text"
          placeholder="Search for services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-80 rounded-l-md"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700"
        >
          Search
        </button>
      </section>

      {/* Services Section */}
      <section id="services" className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Available Services</h2>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">Sorry, no matching services found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(service => (
              <div
                key={service.id}
                className="bg-white shadow-lg p-4 rounded-md border hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold">{service.service_name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <p className="text-green-600 font-semibold mt-2">₹{service.price}</p>
                <button
                  onClick={() => navigate(`/service/${service.id}`)}
                  className="mt-3 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Us */}
      <section id="about" className="bg-gray-100 py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-4">About Us</h2>
        <p className="max-w-3xl mx-auto text-center text-gray-700">
          We are a platform that connects customers with local, skilled service providers
          for all types of needs. Whether it's plumbing, beauty services, home repair,
          or tutoring – we've got you covered!
        </p>
      </section>

      {/* Contact Us */}
      <section id="contact" className="bg-white py-8 px-4 border-t">
        <h2 className="text-2xl font-bold text-center mb-4">Contact Us</h2>
        <div className="text-center">
          <p>Email: support@ondemandservices.com</p>
          <p>Phone: +91-9876543210</p>
          <p>Location: Mumbai, India</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white text-center py-4 mt-6">
        &copy; 2025 On-Demand Services. All rights reserved.
      </footer>
    </div>
  );
};

export default UserDashboard;
