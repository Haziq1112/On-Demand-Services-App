import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const ServiceRegistrationForm = () => {
  const [formData, setFormData] = useState({
    service_type: '',
    description: '',
    location: '',
    price: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access');
      await API.post('/register-service/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Change role to provider and redirect
      localStorage.setItem('role', 'provider');
      navigate('/provider-dashboard');
    } catch (err) {
      console.error(err);
      setError('Service registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register Your Service</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="service_type"
            onChange={handleChange}
            placeholder="Service Type"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="location"
            onChange={handleChange}
            placeholder="Location"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="price"
            type="number"
            onChange={handleChange}
            placeholder="Price"
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            name="description"
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceRegistrationForm;
