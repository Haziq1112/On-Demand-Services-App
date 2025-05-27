import React, { useState } from 'react';

import API from '../api';
import { useNavigate } from 'react-router-dom';

const LoginCard = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login/', formData);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('role', res.data.role);

      if (res.data.role === 'customer') {
        navigate('/user-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login to Your Account</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
