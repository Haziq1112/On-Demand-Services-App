import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const ALLOWED_SERVICES = ['Cleaning', 'Repair', 'Painting', 'Shifting', 'Plumbing', 'Electric'];

const ServiceForm = ({ editingService, onSuccess, setEditingService }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    thumbnail: null,
    gallery: []
  });

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration_minutes: editingService.duration_minutes,
        thumbnail: null,
        gallery: [],
      });
    }
  }, [editingService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    setForm((prev) => ({ ...prev, thumbnail: e.target.files[0] }));
  };

  const handleGalleryChange = (e) => {
    setForm((prev) => ({ ...prev, gallery: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('firebaseIdToken');
  const formData = new FormData();

  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('price', form.price);
  formData.append('duration_minutes', form.duration_minutes);

  if (form.thumbnail) {
    formData.append('thumbnail', form.thumbnail);
  }

  form.gallery.forEach((file) => {
    formData.append('gallery', file);
  });

  try {
    const url = editingService
      ? `http://127.0.0.1:8000/api/update-service/${editingService.id}/`
      : 'http://127.0.0.1:8000/api/add-service/';

    const method = editingService ? 'put' : 'post';

    await axios({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success(editingService ? 'Service updated!' : 'Service created!');
    setForm({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      thumbnail: null,
      gallery: []
    });
    setEditingService(null);
    onSuccess();
  } catch (err) {
    if (err.response) {
      console.error('Server error response:', err.response.data);
      toast.error(`Error: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error('No response received:', err.request);
      toast.error('No response from server.');
    } else {
      console.error('Error setting up request:', err.message);
      toast.error(`Error: ${err.message}`);
    }
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4"
    >
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">
        {editingService ? 'Edit Service' : 'Add New Service'}
      </h2>

      <div>
        <label className="block font-medium">Service Name</label>
        <select
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-md"
          required
        >
          <option value="">Select a service</option>
          {ALLOWED_SERVICES.map((service, i) => (
            <option key={i} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-md"
          rows="4"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Price ($)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            value={form.duration_minutes}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-medium">Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
      </div>

      <div>
        <label className="block font-medium">Gallery Images</label>
        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
      </div>

      <button
        type="submit"
        className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
      >
        {editingService ? 'Update Service' : 'Add Service'}
      </button>
    </form>
  );
};

export default ServiceForm;
