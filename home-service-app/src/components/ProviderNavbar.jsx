import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import ProviderProfileForm from './ProviderProfileForm';
import { ToastContainer, toast } from 'react-toastify';

const ProviderNavbar = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

 const fetchImage = async () => {
  try {
    const token = localStorage.getItem('firebaseIdToken');
    const res = await axios.get('http://127.0.0.1:8000/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const imagePath = res.data?.profile_picture;
    if (imagePath) {
      const fullUrl = imagePath.startsWith('http')
        ? imagePath
        : `http://127.0.0.1:8000${imagePath}`;
      setProfileImage(fullUrl);
    }
  } catch (err) {
    toast.error('Failed to load profile image');
    console.error('Image fetch error:', err);
  }
};

  useEffect(() => {
    fetchImage();
  }, []);

  const handleSwitch = () => navigate('/');

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-purple-600">ProviderPanel</div>
        <div className="flex items-center gap-6">
          <button className="text-gray-700 hover:text-purple-600" onClick={() => navigate('/provider')}>
            Home
          </button>
          <button className="text-gray-700 hover:text-purple-600">Services</button>
          <button className="text-gray-700 hover:text-purple-600">My Bookings</button>

          <Menu as="div" className="relative">
            <Menu.Button className="p-1 hover:bg-gray-100 rounded-full transition duration-200">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring ring-purple-500"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-600" />
              )}
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className={`w-full text-left px-4 py-2 ${active ? 'bg-gray-100' : ''}`}
                    >
                      My Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSwitch}
                      className={`w-full text-left px-4 py-2 ${active ? 'bg-gray-100' : ''}`}
                    >
                      Switch to Customer
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </nav>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              ×
            </button>
            <ProviderProfileForm
              onClose={() => {
                setShowProfileModal(false);
                fetchImage(); // Refresh after profile update
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderNavbar;
