// src/components/ProviderServiceCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/provider/services/${service.id}/edit`)}
      className="bg-white shadow rounded-md overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <img
        src={service.thumbnail || 'https://via.placeholder.com/400x200'}
        alt={service.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-sm text-purple-600 font-semibold">{service.category}</p>
        <h3 className="text-lg font-bold">{service.name}</h3>
        <p className="text-sm text-gray-600">{service.description}</p>
        <p className="text-sm text-gray-500">{service.location}</p>
        <p className="mt-2 text-purple-600 font-bold">Rs.{service.price}</p>
        <p className="text-sm text-gray-500">{service.duration_minutes} minutes</p>
      </div>
    </div>
  );
};

export default ProviderServiceCard;
