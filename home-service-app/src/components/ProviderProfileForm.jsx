import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCamera } from 'react-icons/fa';

const ProviderProfileForm = ({ onClose }) => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('firebaseIdToken');
        const res = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setExistingProfile(res.data);
          setFullName(res.data.full_name || '');
          setBio(res.data.bio || '');
          setLocation(res.data.location || '');
          setEmail(res.data.email || '');
          setPhone(res.data.phone || '');
          if (res.data.profile_picture) {
            setProfileImage(`http://127.0.0.1:8000${res.data.profile_picture}`);;
          }
        }
      } catch (err) {
        toast.info('No existing profile found.');
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append('full_name', fullName);
  form.append('bio', bio);
  form.append('location', location);
  form.append('email', email);
  form.append('phone', phone);

  if (newImageFile) {
    form.append('profile_picture', newImageFile);
  }

  const token = localStorage.getItem('firebaseIdToken');

  try {
    let method, url;

    if (existingProfile && existingProfile.id) {
      // ✅ UPDATE only if profile actually exists
      method = 'put';
      url = 'http://127.0.0.1:8000/api/update-profile/';
    } else {
      // ✅ CREATE if no profile exists yet
      method = 'post';
      url = 'http://127.0.0.1:8000/api/create-profile/';
    }

    await axios({
      method,
      url,
      data: form,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Profile saved successfully!');
    if (onClose) onClose();

  } catch (error) {
    console.error(error.response?.data || error);
    toast.error('Failed to save profile');
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 p-6 bg-white rounded-md shadow-md"
    >
      {/* Profile Image Upload */}
      <div className="flex flex-col items-center">
        <div
          className="relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-md cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              Upload
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow">
            <FaCamera className="text-gray-600" />
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {/* Full Name */}
      <div>
        <label className="block font-semibold">Full Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your Name"
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block font-semibold">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block font-semibold">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State"
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block font-semibold">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
      >
        Save Profile
      </button>
    </form>
  );
};

export default ProviderProfileForm;
