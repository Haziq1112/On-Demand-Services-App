import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookingModal from './BookingModal';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/api/services/${id}/`);
        setService(res.data);
      } catch (err) {
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;
  if (!service) return <div className="p-8 text-red-600 text-center">Service not found.</div>;

  const handleOpenBookingModal = () => setShowBookingModal(true);
  const handleCloseBookingModal = () => setShowBookingModal(false);

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 bg-white shadow-lg rounded-xl my-8 relative">
      {/* Back button with arrow */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-lg font-medium"></span>
      </button>

      {/* Provider Info with dropdown */}
      <div className="flex justify-end items-center mb-6 -mt-4 mr-4 relative" ref={dropdownRef}>
        <div
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center space-x-3 bg-purple-50 p-2 rounded-full pr-4 cursor-pointer"
        >
          <img
            src={service.provider_image || '/default-profile.png'}
            alt={service.provider_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <span className="font-medium text-purple-800">{service.provider_name}</span>
        </div>
        {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-md rounded-lg p-4 z-20">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{service.provider_name}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>Email:</strong> {service.provider_email || 'Not available'}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>Contact:</strong> {service.provider_phone || 'Not available'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Bio:</strong> {service.provider_bio || 'Not available'}
                  </p>
                </div>
              )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2">
          <div className="flex items-center mb-6">
            <img
              src={service.thumbnail}
              alt={service.name}
              className="w-24 h-24 rounded-full object-cover mr-4 shadow-md"
            />
            <div>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                {service.category || 'Uncategorized'}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{service.name}</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {service.description || 'No description available.'}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.gallery_images?.map((imgObj, idx) => (
                <img
                  key={idx}
                  src={imgObj.image}
                  alt={`Gallery ${idx}`}
                  className="rounded-lg object-cover w-full h-48 shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleOpenBookingModal}
            className="w-full md:w-auto px-8 py-4 bg-purple-700 text-white font-semibold rounded-xl text-xl shadow-lg hover:bg-purple-800 transition-colors duration-300 flex items-center justify-center"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal show={showBookingModal} onClose={handleCloseBookingModal} serviceName={service.name} />
    </div>
  );
};

export default ServiceDetail;
