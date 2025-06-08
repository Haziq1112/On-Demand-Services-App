import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaClock, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('booked');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('firebaseIdToken');
        const res = await axios.get('http://127.0.0.1:8000/api/provider/bookings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        setError('Failed to load bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const renderBookingCard = (booking) => (
    <div
      key={booking.id}
      onClick={() => setSelectedBooking(booking)}
      className="cursor-pointer flex p-4 bg-white border rounded-lg shadow hover:shadow-lg transition"
    >
      <div className="w-32 h-32 mr-4 flex-shrink-0">
        <img
          src={booking.service_image || '/default-service.png'}
          alt={booking.service_name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold">{booking.service_name}</h2>
        <p className="text-sm text-purple-600">{booking.customer_name}</p>
        <p className="text-sm text-gray-600 flex items-center">
          <FaMapMarkerAlt className="mr-1" /> {booking.location || 'N/A'}
        </p>
        <p className="text-sm text-gray-800">
          <span className="font-semibold">Date:</span>{' '}
          {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
        </p>
        <p className="text-sm text-gray-800 flex items-center">
          <FaClock className="mr-1" /> {booking.time || 'Time'}
        </p>
        <p className="text-sm font-semibold mt-2">
          Status: <span className="capitalize">{booking.status}</span>
        </p>
        {booking.status === 'cancelled' && booking.cancellation_reason && (
          <p className="text-sm text-red-600 mt-1 italic truncate max-w-xs">
            Reason: {booking.cancellation_reason}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center h-64 items-center text-xl text-gray-600">Loading bookings...</div>;
  }

  if (error) {
    return <div className="flex justify-center h-64 items-center text-xl text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
      <button
        onClick={() => navigate('/provider')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        </button>

      <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['booked', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-lg font-medium capitalize ${
              activeTab === tab
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No {activeTab} bookings found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map(renderBookingCard)}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};

const BookingModal = ({ booking, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full relative shadow-xl">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Service:</strong> {booking.service_name}</p>
          <p><strong>Customer:</strong> {booking.customer_name}</p>
          <p><strong>Location:</strong> {booking.location}</p>
          <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {booking.time}</p>
          <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
          {booking.description && <p><strong>Description:</strong> {booking.description}</p>}
          {booking.status === 'cancelled' && booking.cancellation_reason && (
            <p><strong>Cancellation Reason:</strong> {booking.cancellation_reason}</p>
          )}
          {booking.status === 'completed' && booking.feedback && (
            <div className="pt-4 border-t mt-4">
              <h3 className="text-lg font-semibold">Customer Feedback</h3>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-yellow-400 ${i < booking.feedback.rating ? 'opacity-100' : 'opacity-30'}`}
                  />
                ))}
              </div>
              {booking.feedback.comment && (
                <p className="mt-2 italic text-gray-700">"{booking.feedback.comment}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookings;
