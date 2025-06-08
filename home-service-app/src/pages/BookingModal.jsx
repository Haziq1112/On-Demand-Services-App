import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAuth } from "firebase/auth";

// Fix default Leaflet marker icons
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
}

const BookingModal = ({ show, onClose, serviceId, serviceName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({ name: "", contact: "", description: "", location: "" });
  const [position, setPosition] = useState({ lat: 30.4354, lng: 72.3486 });
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // New: result dialog state
  const [resultDialog, setResultDialog] = useState({ visible: false, success: null, message: "" });

  useEffect(() => {
    if (!show) {
      resetForm();
    } else {
      getCurrentLocation();
    }
  }, [show]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData({ name: "", contact: "", description: "", location: "" });
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCurrentMonth(new Date());
    setPosition({ lat: 30.4354, lng: 72.3486 });
    setLoading(false);
    setShowConfirmDialog(false);
    setResultDialog({ visible: false, success: null, message: "" });
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const lat = coords.latitude;
      const lng = coords.longitude;
      setPosition({ lat, lng });

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data?.display_name) {
          setFormData((prev) => ({ ...prev, location: data.display_name }));
        }
      } catch (err) {
        console.error("Address lookup failed:", err);
      }
    });
  };

  const generateCalendar = () => {
    const days = [];
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = start.getDay();
    const totalDays = end.getDate();

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isToday = (day) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const isPastTime = (slot) => {
    if (!selectedDate) return false;
    const [hourStr, modifier] = slot.split(" ");
    let [hour, minute] = hourStr.split(":");
    hour = parseInt(hour, 10);
    if (modifier === "PM" && hour !== 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;

    const nowTime = new Date();
    const selectedTime = new Date(selectedDate);
    selectedTime.setHours(hour, parseInt(minute), 0, 0);

    return selectedTime < nowTime;
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setResultDialog({ visible: true, success: false, message: "You must be logged in to book." });
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const payload = {
        service: Number(serviceId),
        date: selectedDate.toISOString().split("T")[0],
        time: convertTo24Hour(selectedTimeSlot),
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        latitude: Number(position.lat),
        longitude: Number(position.lng),
      };

      const res = await fetch("http://127.0.0.1:8000/api/bookings/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      setResultDialog({ visible: true, success: true, message: "Booking successful! 🎉" });
    } catch (error) {
      setResultDialog({ visible: true, success: false, message: "Booking failed: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot || !formData.name || !formData.contact || !formData.location) {
      setResultDialog({ visible: true, success: false, message: "Please complete all required fields." });
      return;
    }
    if (!serviceId || isNaN(Number(serviceId))) {
      setResultDialog({ visible: true, success: false, message: "Invalid service selected." });
      return;
    }
    setShowConfirmDialog(true);
  };

  // Close result dialog and also close main booking modal on success
  const closeResultDialog = () => {
    setResultDialog({ visible: false, success: null, message: "" });
    if (resultDialog.success) {
      onClose();
    }
  };

  if (!show) return null;

  if (!serviceId || isNaN(Number(serviceId))) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
          <h2 className="text-xl font-semibold mb-4 text-red-600">Invalid service selected.</h2>
          <p>Please select a valid service to book.</p>
          <button onClick={onClose} className="mt-6 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Booking Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] overflow-auto relative p-6 animate-fadeIn">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>

          <h2 className="text-3xl font-bold mb-2 text-center text-purple-700">
            Book {serviceName}
          </h2>

          <p className="text-center text-sm text-gray-500 animate-pulse mb-4">
            📅 {now.toLocaleDateString()} | 🕒 {now.toLocaleTimeString()}
          </p>

          {/* Calendar */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Select Date</h3>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>◀</button>
              <span>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>▶</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center select-none">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-semibold">{d}</div>
              ))}
              {generateCalendar().map((day, idx) => {
                if (!day) return <div key={idx}></div>;

                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <button
                    key={idx}
                    disabled={isPast}
                    onClick={() => setSelectedDate(day)}
                    className={`py-2 rounded transition-colors ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : isToday(day)
                        ? "bg-purple-200 font-semibold"
                        : "hover:bg-purple-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Select Time</h3>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {[
                "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
                "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
                "05:00 PM", "06:00 PM",
              ].map((slot) => (
                <button
                  key={slot}
                  disabled={!selectedDate || isPastTime(slot)}
                  className={`py-2 rounded transition-all ${
                    selectedTimeSlot === slot
                      ? "bg-purple-600 text-white"
                      : "hover:bg-purple-100"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1" htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="contact">
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Phone or email"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="description">
                Notes / Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Additional details for the service"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="location">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Type or select your location"
              />
              <div className="h-48 rounded overflow-hidden border border-gray-300">
                <MapContainer
                  center={[position.lat, position.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-semibold hover:bg-purple-700 disabled:opacity-70"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <h3 className="text-xl font-semibold text-purple-700 mb-4 text-center">
              Confirm Your Booking
            </h3>
            <p><strong>Service:</strong> {serviceName}</p>
            <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedTimeSlot}</p>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Contact:</strong> {formData.contact}</p>
            <p><strong>Address:</strong> {formData.location}</p>
            {formData.description && (
              <p><strong>Notes:</strong> {formData.description}</p>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Dialog for Success/Error Messages */}
      {resultDialog.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-70 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <button onClick={closeResultDialog} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
            <h3
              className={`text-xl font-semibold mb-4 text-center ${
                resultDialog.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {resultDialog.success ? "Success" : "Error"}
            </h3>
            <p className="text-center whitespace-pre-wrap">{resultDialog.message}</p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={closeResultDialog}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingModal;
