import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { services as serviceCategories } from '../data';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/services/');
      setServices(res.data);
      setFilteredServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = services.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        (s.category && s.category.toLowerCase().includes(term))
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  return (
    <div>
      <Navbar />

      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold">
          Find Home <span className="text-purple-600">Service/Repair</span> Near You
        </h1>
        <p className="mt-4 text-gray-600">Explore Best Home Service & Repair near you</p>

        {/* Search Bar */}
        <div className="flex justify-center mt-6">
          <input
            type="text"
            placeholder="Search services"
            className="w-1/2 p-2 border rounded-l-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md">🔍</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10">
        {/* Categories */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {serviceCategories.map((cat, i) => (
            <CategoryCard key={i} category={cat} />
          ))}
        </div>

        {/* Services List */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Popular Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, i) => (
              <ServiceCard key={i} service={service} />
            ))
          ) : (
            <p className="text-gray-600 col-span-3 text-center">No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
