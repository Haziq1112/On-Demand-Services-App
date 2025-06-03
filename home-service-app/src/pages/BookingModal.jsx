// src/components/BookingModal.jsx
import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to handle map clicks to set marker position
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

const BookingModal = ({ show, onClose, serviceName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    description: "",
    location: "",
  });

  // Leaflet position state (latlng object)
  const [position, setPosition] = useState({ lat: 30.4354, lng: 72.3486 });

  // Reset form on modal close
  useEffect(() => {
    if (!show) {
      setFormData({
        name: "",
        contact: "",
        description: "",
        location: "",
      });
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setCurrentMonth(new Date());
      setPosition({ lat: 30.4354, lng: 72.3486 });
    }
  }, [show]);

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const next = new Date(prevMonth);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
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
    const startDayIndex = firstDayOfMonth.getDay();

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
  today.setHours(0, 0, 0, 0);

  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Geocode manual address input with Nominatim
  const handleAddressSearch = async () => {
    if (!formData.location) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.location
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        setPosition({ lat, lng: lon });
      } else {
        alert("Address not found. Please try a different query.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching address. Please try again.");
    }
  };

  // Get user's current location via Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        // Optional: reverse geocode to fill location input
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setFormData((prev) => ({ ...prev, location: data.display_name }));
            }
          })
          .catch(() => {
            // ignore reverse geocode error silently
          });
      },
      (error) => {
        alert("Unable to retrieve your location.");
        console.error(error);
      }
    );
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (
      !selectedDate ||
      !selectedTimeSlot ||
      !formData.name ||
      !formData.contact ||
      !formData.location
    ) {
      alert("Please fill in all required fields and select a date and time.");
      return;
    }

    const bookingDetails = {
      service: serviceName,
      date: selectedDate.toDateString(),
      time: selectedTimeSlot,
      customer: formData,
      locationCoordinates: position,
    };
    console.log("Booking Details:", bookingDetails);
    alert("Booking Submitted! Check console for details.");
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative flex flex-col h-full max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
          aria-label="Close booking modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8 pb-4 flex-shrink-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Book a Service
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 pb-8 overflow-y-auto flex-grow">
          {/* Date selection */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-3">
              Select Date and Time slot to book a service
            </p>
            <label className="block text-md font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-xl font-semibold text-gray-800">
                  {currentMonth.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
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
                    disabled={!day || day < today}
                    className={`p-2 rounded-full text-center text-gray-800 font-medium transition-colors
                      ${!day ? "invisible" : ""}
                      ${
                        day && day.toDateString() === today.toDateString()
                          ? "ring-2 ring-purple-500"
                          : ""
                      }
                      ${
                        selectedDate &&
                        day &&
                        day.toDateString() === selectedDate.toDateString()
                          ? "bg-purple-600 text-white shadow-lg"
                          : "hover:bg-gray-100"
                      }
                      ${
                        day && day < today
                          ? "text-gray-400 cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    {day ? day.getDate() : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time slot selection */}
          <div className="mb-8">
            <label className="block text-md font-medium text-gray-700 mb-2">
              Select Time Slot
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${
                      selectedTimeSlot === slot
                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }
                  `}
                  disabled={!selectedDate}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Booking form */}
          <form onSubmit={handleBookingSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
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
              <label
                htmlFor="contact"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Contact Number / Email
              </label>
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

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Additional Details (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleFormChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Any special requests or info"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="location"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Location (Type address or click on map)
              </label>
              <div className="flex mb-2 gap-2">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Enter your address"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  aria-label="Manual address input"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="bg-purple-600 text-white px-4 rounded-r-md hover:bg-purple-700 transition-colors"
                  aria-label="Search address"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition-colors"
                  aria-label="Use current location"
                  title="Use my current location"
                >
                  📍
                </button>
              </div>

              <div className="h-64 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
