// src/components/BookingModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const libraries = ["places"]; // Required for StandaloneSearchBox

const BookingModal = ({ show, onClose, serviceName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    description: '',
    location: '', // For the text input
  });

  const searchBoxRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 30.4354, lng: 72.3486 }); // Default center (e.g., Mian Channu)

  // Clear form and selections when modal opens/closes
  useEffect(() => {
    if (!show) {
      setFormData({
        name: '',
        contact: '',
        description: '',
        location: '',
      });
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setCurrentMonth(new Date()); // Reset calendar to current month
    }
  }, [show]);

  if (!show) return null;

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const next = new Date(prevMonth);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const prev = new Date(prevMonth);
      prev.setMonth(prev.getMonth() - 1);
      return prev;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    const days = [];
    // Add leading empty cells for the first day of the week
    const startDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday, 6 for Saturday
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }

    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to just date for comparison

  const timeSlots = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM',
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot || !formData.name || !formData.contact || !formData.location) {
      alert('Please fill in all required fields and select a date and time.');
      return;
    }

    const bookingDetails = {
      service: serviceName,
      date: selectedDate.toDateString(),
      time: selectedTimeSlot,
      customer: formData,
    };
    console.log('Booking Details:', bookingDetails);
    alert('Booking Submitted! Check console for details.');
    onClose(); // Close the modal on successful submission
  };

  const handlePlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        setFormData(prev => ({ ...prev, location: place.formatted_address }));
        if (place.geometry && place.geometry.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative flex flex-col h-full max-h-[90vh]"> {/* Added flex, flex-col, h-full, max-h-[90vh] */}
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10" // Added z-10 to ensure it's on top
          aria-label="Close booking modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 pb-4 flex-shrink-0"> {/* Added pb-4 and flex-shrink-0 */}
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Book an Service</h2>
        </div>

        {/* Scrollable Content Area */}
        <div className="px-8 pb-8 overflow-y-auto flex-grow"> {/* Added overflow-y-auto and flex-grow, adjust padding */}
          {/* Date Selection */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-3">Select Date and Time slot to book an service</p>
            <label className="block text-md font-medium text-gray-700 mb-2">Select Date</label>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xl font-semibold text-gray-800">
                  {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day || day < today} // Disable past dates
                    className={`p-2 rounded-full text-center text-gray-800 font-medium transition-colors
                      ${!day ? 'invisible' : ''}
                      ${day && day.toDateString() === today.toDateString() ? 'ring-2 ring-purple-500' : ''}
                      ${selectedDate && day && day.toDateString() === selectedDate.toDateString() ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
                      ${day && day < today ? 'text-gray-400 cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {day ? day.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="mb-8">
            <label className="block text-md font-medium text-gray-700 mb-2">Select Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${selectedTimeSlot === slot
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}
                  `}
                  disabled={!selectedDate} // Disable if no date is selected
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBookingSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-md font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="contact" className="block text-md font-medium text-gray-700 mb-2">Contact Number / Email</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleFormChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="123-456-7890 or example@email.com"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-md font-medium text-gray-700 mb-2">Service Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="E.g., Specific areas to focus on, special requests."
              ></textarea>
            </div>

            {/* Google Maps API Location Picker (Placeholder) */}
            <div className="mb-6">
              <label htmlFor="location" className="block text-md font-medium text-gray-700 mb-2">Location (through Google Maps API)</label>
              <LoadScript
                googleMapsApiKey="YOUR_Maps_API_KEY" // Replace with your actual API key
                libraries={libraries}
              >
                <StandaloneSearchBox
                  onLoad={ref => searchBoxRef.current = ref}
                  onPlacesChanged={handlePlacesChanged}
                >
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange} // Allow manual typing too
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Search for your address..."
                    required
                  />
                </StandaloneSearchBox>
                {/* Optional: Display a small map if a location is selected */}
                {formData.location && mapCenter && (
                  <div className="mt-4 w-full h-48 rounded-md overflow-hidden border border-gray-300">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={15}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      {/* You can add a Marker here for the selected location */}
                    </GoogleMap>
                  </div>
                )}
              </LoadScript>
              <p className="mt-1 text-sm text-gray-500">
                Start typing your address; suggestions will appear.
              </p>
            </div>
          </form> {/* Moved form closing tag here to wrap all fields */}
        </div>

        {/* Fixed Footer for the button */}
        <div className="p-8 pt-4 flex-shrink-0"> {/* Added pt-4 and flex-shrink-0 */}
            <button
              type="submit" // This button now needs to be part of the form above or trigger its submission
              onClick={handleBookingSubmit} // Moved onClick here
              className="w-full px-6 py-3 bg-purple-700 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-purple-800 transition-colors duration-300"
            >
              Confirm Booking
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;