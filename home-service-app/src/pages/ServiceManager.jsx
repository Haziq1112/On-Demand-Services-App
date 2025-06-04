// src/pages/ServiceManager.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProviderServiceCard from '../components/ProviderServiceCard';
import ServiceForm from '../components/ServiceForm'; // the one from previous step
import ProviderNavbar from '../components/ProviderNavbar';
import { ToastContainer, toast } from 'react-toastify';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const res = await axios.get('http://127.0.0.1:8000/api/my-services/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to load services');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      await axios.delete(`http://127.0.0.1:8000/api/delete-service/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Service deleted');
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <>
      <ProviderNavbar />
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Manage Services</h2>
          <button
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            + Add New Service
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <ProviderServiceCard
  key={service.id}
  service={service}
  onEdit={(s) => {
    setEditingService(s);
    setShowForm(true);
  }}
  onDelete={handleDelete}
/>

          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl"
            >
              ×
            </button>
            <ServiceForm
              existingService={editingService}
              onClose={() => {
                setShowForm(false);
                fetchServices();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceManager;
