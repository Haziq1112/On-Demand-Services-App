import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookingModal from './BookingModal';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [similarServices, setSimilarServices] = useState([]);
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

  useEffect(() => {
    const fetchSimilarServices = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/services/?category=${service.category}`);
        const filtered = res.data.filter((s) => s.id !== service.id);
        setSimilarServices(filtered);
      } catch (err) {
        console.error('Failed to fetch similar services', err);
      }
    };

    if (service?.category) {
      fetchSimilarServices();
    }
  }, [service]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;
  if (!service) return <div className="p-8 text-red-600 text-center">Service not found.</div>;

  const handleOpenBookingModal = () => setShowBookingModal(true);
  const handleCloseBookingModal = () => setShowBookingModal(false);

  return (
    <motion.div
      className="max-w-7xl mx-auto py-8 px-6 bg-gradient-to-b from-white to-purple-50 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-purple-700 flex items-center text-sm transition"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Provider Compact Info */}
        <div
          className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          ref={dropdownRef}
        >
          <img
            src={service.provider_image || '/default-profile.png'}
            alt={service.provider_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
          />
          <span className="text-sm font-medium text-gray-800">{service.provider_name}</span>
        </div>

        <AnimatePresence>
          {showProfileDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-6 w-64 bg-white shadow-xl rounded-lg p-4 z-20"
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{service.provider_name}</h3>
              <p className="text-gray-600 text-sm mb-1"><strong>Email:</strong> {service.provider_email || 'Not available'}</p>
              <p className="text-gray-600 text-sm mb-1"><strong>Contact:</strong> {service.provider_phone || 'Not available'}</p>
              <p className="text-gray-600 text-sm"><strong>Bio:</strong> {service.provider_bio || 'Not available'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Service Info */}
          <motion.div className="flex items-start space-x-6 mb-6" whileHover={{ scale: 1.02 }}>
            <img src={service.thumbnail} alt={service.name} className="w-24 h-24 rounded-xl object-cover shadow-md" />
            <div>
              <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">{service.category}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{service.name}</h1>
              <p className="text-lg text-purple-700 font-semibold mt-1">Price: Rs.{service.price}</p>
            </div>
          </motion.div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed text-base">{service.description || 'No description available.'}</p>
          </div>

          {/* Gallery */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {service.gallery_images?.map((imgObj, idx) => (
                <motion.img
                  key={idx}
                  src={imgObj.image}
                  alt={`Gallery ${idx}`}
                  className="w-full h-40 rounded-lg object-cover shadow-md"
                  whileHover={{ scale: 1.03 }}
                />
              ))}
            </div>
          </div>

          {/* Book Appointment Button */}
          <div className="mt-6">
            <motion.button
              onClick={handleOpenBookingModal}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Appointment
            </motion.button>
          </div>
        </div>

        {/* Sidebar - Similar Services */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Similar Business</h2>
          {similarServices.length > 0 ? (
            <div className="space-y-4">
              {similarServices.map((simService) => (
                <motion.div
                  key={simService.id}
                  onClick={() => navigate(`/services/${simService.id}`)}
                  className="flex items-start space-x-3 bg-white border p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <img
                    src={simService.thumbnail}
                    alt={simService.name}
                    className="w-14 h-14 rounded object-cover"
                  />
                  <div>
                    <h3 className="text-md font-medium text-gray-800">{simService.name}</h3>
                    <p className="text-sm text-gray-500">{simService.provider_name}</p>
                    <p className="text-xs text-gray-400">{simService.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No similar businesses found.</p>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal show={showBookingModal} onClose={handleCloseBookingModal} serviceName={service.name} serviceId={service.id}/>
    </motion.div>
  );
};

export default ServiceDetail;
