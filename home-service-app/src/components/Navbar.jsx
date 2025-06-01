import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          setUserData({ uid: user.uid, ...docSnap.data() });
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="flex justify-between items-center p-4 shadow-md bg-white">
      <Link to="/" className="text-2xl font-bold text-purple-600">On-Demand Services</Link>

      <ul className="flex space-x-6 text-gray-700 font-medium">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>

      {userData ? (
        <div className="relative">
          <FaUserCircle
            className="text-3xl cursor-pointer"
            onClick={toggleDropdown}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-48 z-50 text-black">
              <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
              <Link to="/bookings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">My Booking</Link>
              <Link to="/provider" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Switch to Provider</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-md"
          onClick={() => navigate('/login')}
        >
          Login / Sign Up
        </button>
      )}
    </nav>
  );
};

export default Navbar;
