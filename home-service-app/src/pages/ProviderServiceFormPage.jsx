// src/pages/ProviderServiceFormPage.jsx
import React, { useState } from 'react';
import ServiceForm from '../components/ServiceForm';
import { useNavigate } from 'react-router-dom';

const ProviderServiceFormPage = () => {
  const [editingService, setEditingService] = useState(null);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/provider'); // Navigate to dashboard on success
  };

  return (
    <ServiceForm
      editingService={editingService}
      setEditingService={setEditingService}
      onSuccess={handleSuccess}
    />
  );
};

export default ProviderServiceFormPage;
