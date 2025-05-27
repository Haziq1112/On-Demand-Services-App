import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const SignupCard = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/signup/', formData);
      setSuccess('Signup successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Signup failed. Check fields.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="email"
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full py-2 text-white bg-green-500 hover:bg-green-600 rounded-md transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-green-500 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignupCard;
