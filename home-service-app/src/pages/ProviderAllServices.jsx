import React, { useEffect, useState } from 'react';
import ProviderNavbar from '../components/ProviderNavbar';
import ProviderServiceCard from '../components/ProviderServiceCard';

const ProviderAllServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch('http://127.0.0.1:8000/api/provider/services/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div>
      <ProviderNavbar />
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">All Your Services</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading services...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <ProviderServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderAllServices;
