// src/pages/ProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import ProviderNavbar from '../components/ProviderNavbar';
import ProviderServiceCard from '../components/ProviderServiceCard';
import AddNewServiceCard from '../components/AddNewServiceCard';
import ProviderCategoryCard from '../components/ProviderCategoryCard';
import { services as dummyCategories } from '../data';

const ProviderDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [providerServices, setProviderServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch('http://127.0.0.1:8000/api/provider/services/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch provider services');
      }

      const data = await response.json();
      setProviderServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = providerServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || service.location === locationFilter)
  );

  return (
    <div>
      <ProviderNavbar />

      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold">
          Manage Your <span className="text-purple-600">Services & Bookings</span>
        </h1>
        <p className="mt-4 text-gray-600">
          Keep your business updated and discover new clients
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mt-6">
          <input
            type="text"
            placeholder="Search your services"
            className="w-1/2 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition">
            🔍
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10">
        {/* Categories Section */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {dummyCategories.map((category, i) => (
            <ProviderCategoryCard key={i} category={category} />
          ))}
        </div>

        {/* Services Section */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Your Listed Services</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading your services...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ProviderServiceCard key={service.id} service={service} />
            ))}
            <AddNewServiceCard />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
