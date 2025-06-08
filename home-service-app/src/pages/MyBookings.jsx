import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('booked');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelOtherText, setCancelOtherText] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) throw new Error('Authentication token not found');

      const res = await axios.get('http://127.0.0.1:8000/api/bookings/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your bookings. Please try again.');
      toast.error('Error fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const handleCompleteClick = () => {
    setRating(0);
    setComment('');
    setShowReviewDialog(true);
  };

  const submitFeedback = async () => {
    if (rating === 0) return toast.error('Please select a rating');
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
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback.');
    }
  };

  const handleCancelClick = () => {
    setCancelReason(CANCEL_REASONS[0]);
    setCancelOtherText('');
    setShowCancelDialog(true);
  };

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
      toast.info('Booking cancelled.');
      setShowCancelDialog(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel booking.');
    }
  };

  const renderBookingCard = booking => (
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
        <p className="text-sm text-purple-600">{booking.provider_name}</p>
        <p className="text-sm text-gray-600">Booked By: {booking.customer_name}</p>
        <p className="text-sm text-gray-600 flex items-center">
          <FaMapMarkerAlt className="mr-1" /> {booking.location}
        </p>
        <p className="text-sm text-gray-800">
          <span className="font-semibold">Date:</span>{' '}
          {new Date(booking.service_date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-800 flex items-center">
          <FaClock className="mr-1" /> {booking.service_time}
        </p>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex justify-center h-64 items-center text-xl text-gray-600">
        Loading your bookings...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center h-64 items-center text-xl text-red-600">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
        <button
        onClick={() => navigate('/')}
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

      {/* Booking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          <div className="md:col-span-2 text-center py-12 text-gray-500">
            No {activeTab} bookings found.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancelClick}
          onComplete={handleCompleteClick}
        />
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <ReviewDialog
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          onCancel={() => setShowReviewDialog(false)}
          onSubmit={submitFeedback}
        />
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <CancelDialog
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelOtherText={cancelOtherText}
          setCancelOtherText={setCancelOtherText}
          onCancel={() => setShowCancelDialog(false)}
          onSubmit={submitCancel}
        />
      )}
    </div>
  );
};

// ----- Booking Modal (Updated with cancel reason) -----
const BookingModal = ({ booking, onClose, onCancel, onComplete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full relative shadow-xl">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        <FaTimes size={20} />
      </button>
      <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Service:</strong> {booking.service_name}</p>
        <p><strong>Provider:</strong> {booking.provider_name}</p>
        <p><strong>Booked By:</strong> {booking.customer_name}</p>
        <p><strong>Location:</strong> {booking.location}</p>
        <p><strong>Date:</strong> {new Date(booking.service_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {booking.service_time}</p>
        <p><strong>Contact:</strong> {booking.contact || 'N/A'}</p>
        <p><strong>Description:</strong> {booking.description || 'N/A'}</p>
        {booking.status === 'cancelled' && booking.cancel_reason && (
        <p><strong>Cancellation Reason:</strong> {booking.cancellation_reason}</p>
        )}
      </div>
      {booking.status === 'booked' && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onCancel}
          >
            Cancel Booking
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={onComplete}
          >
            Mark as Completed
          </button>
        </div>
      )}
    </div>
  </div>
);

// ----- Review Dialog -----
const ReviewDialog = ({ rating, setRating, comment, setComment, onCancel, onSubmit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
      <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onCancel}>
        <FaTimes size={20} />
      </button>
      <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
      <div className="mb-4">
        <p className="mb-2 font-medium">Rate the service:</p>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} filled={star <= rating} onClick={() => setRating(star)} />
          ))}
        </div>
      </div>
      <textarea
        placeholder="Write your feedback (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full p-2 border rounded resize-none"
        rows={4}
      />
      <div className="flex justify-end mt-4 gap-3">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Submit
        </button>
      </div>
    </div>
  </div>
);

// ----- Cancel Dialog -----
const CancelDialog = ({ cancelReason, setCancelReason, cancelOtherText, setCancelOtherText, onCancel, onSubmit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
      <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onCancel}>
        <FaTimes size={20} />
      </button>
      <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
      <label className="block mb-2 font-medium">
        Select Reason:
        <select
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        >
          {CANCEL_REASONS.map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </label>
      {cancelReason === 'Other' && (
        <textarea
          placeholder="Please specify"
          value={cancelOtherText}
          onChange={e => setCancelOtherText(e.target.value)}
          className="w-full p-2 border rounded resize-none mb-4"
          rows={3}
        />
      )}
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Back
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
);

// ----- Star Component -----
const Star = ({ filled, onClick }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    className={`h-8 w-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    fill="currentColor"
    viewBox="0 0 24 24"
    stroke="none"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default MyBookings;
