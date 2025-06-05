import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';

const Category = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/services/');
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const lowerName = name.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(lowerName) ||
        service.description?.toLowerCase().includes(lowerName) ||
        (service.category && service.category.toLowerCase().includes(lowerName))
    );
    setFilteredServices(filtered);
  }, [name, services]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        </button>

        <h2 className="text-2xl font-bold mb-4">{name} Services</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, i) => (
              <ServiceCard key={i} service={service} />
            ))
          ) : (
            <p className="text-gray-600 col-span-3 text-center">No services found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
