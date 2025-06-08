import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import ProviderProfileForm from './ProviderProfileForm';
import { ToastContainer, toast } from 'react-toastify';

const ProviderNavbar = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const menuItems = [
    { name: 'Home', onClick: () => navigate('/provider') },
    { name: 'Services', onClick: () => navigate('/provider/servicess') },
    { name: 'My Bookings', onClick: () => navigate('/provider/bookings') },
  ];

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left */}
            <div className="flex-shrink-0 text-2xl font-bold text-purple-600">
              ProviderPanel
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="text-gray-700 hover:text-purple-600"
                >
                  {item.name}
                </button>
              ))}

              {/* Profile dropdown */}
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

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-purple-600"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Items */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white shadow-md">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-purple-600"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                setShowProfileModal(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-purple-600"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                handleSwitch();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-purple-600"
            >
              Switch to Customer
            </button>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
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
