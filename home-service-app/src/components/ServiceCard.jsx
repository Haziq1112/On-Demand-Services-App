import React, { useState } from 'react';

const ServiceCard = ({ service }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white shadow rounded-md overflow-hidden">
      <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <p className="text-sm text-purple-600 font-semibold">{service.category}</p>
        <h3 className="text-lg font-bold">{service.name}</h3>
        <p className="text-sm text-gray-600">{service.person}</p>
        <p className="text-sm text-gray-500">{service.location}</p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          Book Now
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md text-center">
            <h2 className="text-lg font-bold mb-2">Booking Confirmed!</h2>
            <p className="mb-4">You've booked <strong>{service.name}</strong>.</p>
            <button onClick={() => setShowModal(false)} className="bg-purple-600 text-white px-4 py-2 rounded-md">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
