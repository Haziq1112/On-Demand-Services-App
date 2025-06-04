import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProviderNavbar from '../components/ProviderNavbar';
import ServiceForm from '../components/ServiceForm';
import ServiceCard from '../components/ServiceCard';
import { ToastContainer, toast } from 'react-toastify';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const res = await axios.get('http://127.0.0.1:8000/api/provider/services/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (err) {
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div>
      <ToastContainer />
      <ProviderNavbar />
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Manage Your Services</h1>
        <ServiceForm onSuccess={fetchServices} editingService={editingService} setEditingService={setEditingService} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {services.length ? (
            services.map((s) => (
              <ServiceCard key={s.id} service={s} onEdit={() => setEditingService(s)} />
            ))
          ) : (
            <p className="text-gray-600">No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderServices;
