// src/pages/ProviderCategory.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProviderNavbar from '../components/ProviderNavbar';
import ProviderServiceCard from '../components/ProviderServiceCard';

const ProviderCategory = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  const fetchProviderServices = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch('http://127.0.0.1:8000/api/provider/services/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch provider services');

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProviderServices();
  }, []);

  useEffect(() => {
    const lowerName = name.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.category &&
        service.category.toLowerCase().includes(lowerName)
    );
    setFilteredServices(filtered);
  }, [name, services]);

  return (
    <div>
      <ProviderNavbar />
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <button
          onClick={() => navigate('/provider')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-4">{name} Services</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ProviderServiceCard key={service.id} service={service} />
            ))
          ) : (
            <p className="text-gray-600 col-span-3 text-center">No services found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderCategory;
