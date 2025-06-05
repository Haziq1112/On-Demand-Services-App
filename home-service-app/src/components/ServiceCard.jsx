import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/services/${service.id}`)}
      className="bg-white shadow rounded-md overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <img
        src={service.thumbnail}
        alt={service.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-sm text-purple-600 font-semibold">
          {service.category || 'Uncategorized'}
        </p>
        <h3 className="text-lg font-bold">{service.name}</h3>
        <p className="text-sm text-gray-500">{service.description?.slice(0, 60)}...</p>
        <p className="text-sm text-gray-600 mt-2">Rs.{service.price}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
