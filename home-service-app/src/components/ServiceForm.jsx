import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const ALLOWED_SERVICES = ['Cleaning', 'Repair', 'Painting', 'Shifting', 'Plumbing', 'Electric'];

const ServiceForm = ({ editingService = null, onSuccess = () => {}, setEditingService = () => {},}) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    thumbnail: null,
    gallery: [],
    category: '',
  });

  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration_minutes: editingService.duration_minutes,
        thumbnail: null,
        gallery: [],
        category: editingService.category || '',
      });

      setExistingThumbnail(editingService.thumbnail || null);
      setExistingGallery(editingService.gallery_images || []);
    }
  }, [editingService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    setForm((prev) => ({ ...prev, thumbnail: e.target.files[0] }));
    setExistingThumbnail(null);
  };

  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...newFiles],
    }));
  };

  const handleDelete = async () => {
    if (!editingService) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('firebaseIdToken');
      await axios.delete(`http://127.0.0.1:8000/api/delete-service/${editingService.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Service deleted successfully!');
      resetForm();
      setEditingService?.(null);
      onSuccess();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      toast.error('Failed to delete service.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('firebaseIdToken');
    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('duration_minutes', form.duration_minutes);
    formData.append('category', form.category); // ✅ Append category

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
      resetForm();
      setEditingService?.(null);
      onSuccess();
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      toast.error('Error saving service.');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      thumbnail: null,
      gallery: [],
      category: '',
    });
    setExistingThumbnail(null);
    setExistingGallery([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 max-w-3xl mx-auto mt-8 transition-all duration-300 animate-fade-in"
    >
      <ToastContainer />

      <button
        type="button"
        onClick={() => navigate('/provider')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition"
      >
        <FaArrowLeft />
      </button>

      <h2 className="text-2xl font-semibold text-purple-700 tracking-wide">
        {editingService ? 'Edit Service' : 'Add New Service'}
      </h2>

 <div>
  <label className="block font-medium">Service Name</label>
  <input
    type="text"
    name="name"
    value={form.name}
    onChange={handleChange}
    placeholder="Enter service name"
    className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
    required
  />
</div>


      <div>
        <label className="block font-medium">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        >
          <option value="">Select a category</option>
          {ALLOWED_SERVICES.map((category, i) => (
            <option key={i} value={category}>
              {category}
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
          className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          rows="4"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium">Price (Rs.)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            value={form.duration_minutes}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-medium">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="mt-1"
        />
        {existingThumbnail && (
          <img
            src={existingThumbnail}
            alt="Current thumbnail"
            className="mt-3 w-32 h-32 object-cover rounded shadow"
          />
        )}
      </div>

      <div>
        <label className="block font-medium">Gallery Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="mt-1"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {existingGallery.map((img) => (
            <img
              key={img.id}
              src={img.image}
              alt="Gallery"
              className="w-24 h-24 object-cover rounded shadow"
            />
          ))}
          {form.gallery.map((file, idx) => (
            <img
              key={`new-${idx}`}
              src={URL.createObjectURL(file)}
              alt="New upload"
              className="w-24 h-24 object-cover rounded border-2 border-dashed border-purple-300 shadow"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 shadow"
        >
          {editingService ? 'Update Service' : 'Add Service'}
        </button>

        {editingService && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200 shadow"
          >
            Delete Service
          </button>
        )}
      </div>
    </form>
  );
};

export default ServiceForm;
