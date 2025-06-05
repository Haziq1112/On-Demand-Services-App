import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAuth } from "firebase/auth";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

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
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    description: "",
    location: "",
  });
  const [position, setPosition] = useState({ lat: 30.4354, lng: 72.3486 });
  const [loading, setLoading] = useState(false);

  // Debug log serviceId to check if valid
  useEffect(() => {
    console.log("BookingModal serviceId:", serviceId);
  }, [serviceId]);

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
      setLoading(false);
    }
  }, [show]);

  const generateCalendar = () => {
    const days = [];
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = start.getDay();
    const totalDays = end.getDate();

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || !formData.name || !formData.contact || !formData.location) {
      alert("Please complete all required fields.");
      return;
    }

    if (!serviceId || isNaN(Number(serviceId))) {
      alert("Invalid service selected.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to book.");
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

      console.log("Booking payload:", payload);

      const res = await fetch("http://127.0.0.1:8000/api/bookings/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Booking creation error response:", data);
        throw new Error(data.detail || JSON.stringify(data));
      }

      alert("Booking successful!");
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // **Check if serviceId is invalid, show fallback inside modal**
  if (!serviceId || isNaN(Number(serviceId))) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            ✕
          </button>
          <h2 className="text-xl font-semibold mb-4 text-red-600">Invalid service selected.</h2>
          <p>Please select a valid service to book.</p>
          <button
            onClick={onClose}
            className="mt-6 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[90vh] overflow-auto relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          ✕
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center">
          Book {serviceName}
        </h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Date</h3>
          <div className="flex items-center justify-between mb-2">
            <button onClick={goToPreviousMonth}>◀</button>
            <span>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
            <button onClick={goToNextMonth}>▶</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((day, index) => (
              <button
                key={index}
                disabled={!day}
                className={`p-2 rounded ${
                  selectedDate?.toDateString() === day?.toDateString()
                    ? "bg-purple-600 text-white"
                    : "hover:bg-purple-100"
                }`}
                onClick={() => setSelectedDate(day)}
              >
                {day ? day.getDate() : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Time Slot</h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                className={`p-2 rounded border ${
                  selectedTimeSlot === slot
                    ? "bg-purple-600 text-white"
                    : "hover:bg-purple-100"
                }`}
                onClick={() => setSelectedTimeSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="contact"
            placeholder="Phone or Email"
            className="w-full border p-2 rounded"
            value={formData.contact}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Address"
            className="w-full border p-2 rounded"
            value={formData.location}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Additional Notes (optional)"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={handleInputChange}
          />

          <div className="h-60">
            <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          <button
            type="submit"
            className={`w-full py-3 mt-4 rounded font-semibold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
