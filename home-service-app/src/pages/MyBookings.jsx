import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaClock, FaTimes } from 'react-icons/fa';

const CANCEL_REASONS = [
  'Change of plans',
  'Found a better provider',
  'Service not needed anymore',
  'Other',
];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('booked');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Review dialog states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Cancel dialog state
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelOtherText, setCancelOtherText] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const res = await axios.get('http://127.0.0.1:8000/api/bookings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Failed to load your bookings. Please try again.');
        toast.error('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  // Handle opening review dialog
  const handleCompleteClick = () => {
    setRating(0);
    setComment('');
    setShowReviewDialog(true);
  };

  // Submit feedback for completed booking
  const submitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      const token = localStorage.getItem('firebaseIdToken');
      await axios.post(
       `http://127.0.0.1:8000/api/bookings/${selectedBooking.id}/feedback/`,
        {
          booking: selectedBooking.id,
          rating,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Thank you for your feedback!');
      setShowReviewDialog(false);
      setSelectedBooking(null);
      // Optionally refresh bookings list or update status locally
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    setCancelReason(CANCEL_REASONS[0]);
    setCancelOtherText('');
    setShowCancelDialog(true);
  };

  // Submit cancel request
  const submitCancel = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      await axios.post(
        `http://127.0.0.1:8000/api/bookings/${selectedBooking.id}/cancel/`,
        {
          reason: cancelReason === 'Other' ? cancelOtherText : cancelReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info('Booking cancelled successfully.');
      setShowCancelDialog(false);
      setSelectedBooking(null);
      // Optionally refresh bookings list
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {['booked', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === tab
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="cursor-pointer flex p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <div className="w-32 h-32 flex-shrink-0 mr-4">
                <img
                  src={booking.provider_image || '/default-service.png'}
                  alt={booking.service_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{booking.service_name}</h2>
                <p className="text-gray-700 font-medium mb-1">
                  <span className="text-purple-600">{booking.provider_name}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-1 text-gray-400" />
                  {booking.location}
                </p>
                <p className="text-sm text-gray-800 mb-1">
                  <span className="font-semibold">Service on:</span>{' '}
                  {new Date(booking.service_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-800 flex items-center">
                  <FaClock className="mr-1 text-gray-400" />
                  {booking.service_time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 text-center py-12 text-gray-500 text-lg">
            No {activeTab} bookings found.
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedBooking(null)}
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Service:</strong> {selectedBooking.service_name}
              </p>
              <p>
                <strong>Provider:</strong> {selectedBooking.provider_name}
              </p>
              <p>
                <strong>Location:</strong> {selectedBooking.location}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(selectedBooking.service_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p>
                <strong>Time:</strong> {selectedBooking.service_time}
              </p>
              <p>
                <strong>Contact:</strong> {selectedBooking.contact || 'N/A'}
              </p>
              <p>
                <strong>Description:</strong> {selectedBooking.description || 'N/A'}
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cancel Booking
              </button>
              <button
                onClick={handleCompleteClick}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowReviewDialog(false)}
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
            <div className="mb-4">
              <p className="mb-2 font-medium">Rate the service:</p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={star <= rating}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Write your review (optional)"
                className="w-full border border-gray-300 rounded p-2 resize-none focus:outline-purple-500"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowReviewDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={submitFeedback}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCancelDialog(false)}
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
            <p className="mb-3">Please select a reason for cancellation:</p>
            <select
              className="w-full border border-gray-300 rounded p-2 mb-3 focus:outline-purple-500"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              {CANCEL_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {cancelReason === 'Other' && (
              <textarea
                placeholder="Please specify your reason"
                className="w-full border border-gray-300 rounded p-2 mb-3 resize-none focus:outline-purple-500"
                rows={3}
                value={cancelOtherText}
                onChange={(e) => setCancelOtherText(e.target.value)}
              />
            )}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowCancelDialog(false)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={submitCancel}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Star component for rating UI
const Star = ({ filled, onClick }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.438a1 1 0 00-.364 1.118l1.286 3.954c.3.922-.755 1.688-1.54 1.118l-3.36-2.438a1 1 0 00-1.175 0l-3.36 2.438c-.785.57-1.84-.196-1.54-1.118l1.286-3.954a1 1 0 00-.364-1.118L2.225 9.382c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.955z" />
  </svg>
);

export default MyBookings;
