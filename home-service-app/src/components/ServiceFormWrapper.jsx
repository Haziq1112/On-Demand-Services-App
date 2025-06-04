import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceForm from './ServiceForm';
import axios from 'axios';

const ServiceFormWrapper = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      const token = localStorage.getItem('firebaseIdToken');
      axios.get(`http://127.0.0.1:8000/api/services/${serviceId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setEditingService(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading service:', error);
        setLoading(false);
        // Optionally redirect if service not found
        navigate('/provider/services');
      });
    } else {
      setLoading(false); // no serviceId means adding new service
    }
  }, [serviceId, navigate]);

  const handleSuccess = () => {
    // After saving, navigate back to services list or wherever you want
    navigate('/provider/services');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ServiceForm
      editingService={editingService}
      setEditingService={setEditingService}
      onSuccess={handleSuccess}
    />
  );
};

export default ServiceFormWrapper;
