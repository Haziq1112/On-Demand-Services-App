import React, { useState } from 'react'; // Import useState
import { useParams, useNavigate } from 'react-router-dom';
import { businesses } from '../data';
import BookingModal from './BookingModal'; // Import the new BookingModal component

const SimilarBusinessCard = ({ business }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/services/${business.id}`)}
      className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
    >
      <img
        src={business.image}
        alt={business.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h3 className="text-md font-semibold text-gray-800">{business.name}</h3>
        <p className="text-sm text-gray-500">{business.person}</p>
        <p className="text-xs text-gray-400">{business.location}</p>
      </div>
    </div>
  );
};

const ServiceDetail = () => {
  const { id } = useParams();
  const service = businesses.find((b) => b.id === parseInt(id));
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false); // State to control modal visibility

  if (!service) {
    return <div className="p-8 text-red-600 text-center">Service not found.</div>;
  }

  const similarBusinesses = businesses
    .filter((b) => b.id !== service.id && b.category === service.category)
    .slice(0, 3);

  const handleOpenBookingModal = () => {
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 bg-white shadow-lg rounded-xl my-8 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-lg font-medium">Back to Home</span>
      </button>

      {/* Provider Info */}
      <div className="flex justify-end items-center mb-6 -mt-4 mr-4">
        <div className="flex items-center space-x-3 bg-purple-50 p-2 rounded-full pr-4">
          <img
            src={service.image}
            alt={service.person}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <span className="font-medium text-purple-800">{service.person}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Main Service Info */}
        <div className="md:col-span-2">
          {/* Header */}
          <div className="flex items-center mb-6">
            <img
              src={service.image}
              alt={service.name}
              className="w-24 h-24 rounded-full object-cover mr-4 shadow-md"
            />
            <div>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                {service.category}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{service.name}</h1>
              <p className="text-gray-600 text-lg flex items-center">
                <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {service.location}
              </p>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-8 flex items-center text-gray-700">
            <svg className="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available: {service.availability || '8:00 AM to 10:00 PM'}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {service.description ||
                'No description available. Please contact the provider for more details.'}
            </p>
          </div>

          {/* Gallery */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Gallery ${idx}`}
                  className="rounded-lg object-cover w-full h-48 shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              ))}
            </div>
          </div>

          {/* Book Appointment Button - now opens the modal */}
          <button
            onClick={handleOpenBookingModal} // Call handler to open modal
            className="w-full md:w-auto px-8 py-4 bg-purple-700 text-white font-semibold rounded-xl text-xl shadow-lg hover:bg-purple-800 transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </button>
        </div>

        {/* Right: Similar Businesses */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Business</h2>
          <div>
            {similarBusinesses.length > 0 ? (
              similarBusinesses.map((business) => (
                <SimilarBusinessCard key={business.id} business={business} />
              ))
            ) : (
              <p className="text-gray-500">No similar businesses found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onClose={handleCloseBookingModal}
        serviceName={service.name} // Pass service name to modal
      />
    </div>
  );
};

export default ServiceDetail;