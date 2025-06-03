import React, { useState } from 'react';
import { auth, provider, db } from '../firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailPasswordForm, setShowEmailPasswordForm] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔐 Get Firebase ID token
  async function getFirebaseIdToken(user) {
    return await user.getIdToken();
  }

  // 🔄 Send token to Django backend
  const verifyTokenWithBackend = async (idToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/verify-firebase-token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebase_token: idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Token verification failed');
      console.log('✅ Backend verified user:', data);
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
    }
  };

  const redirectBasedOnRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', res.user.uid);
      const userSnap = await getDoc(userRef);

      const idToken = await getFirebaseIdToken(res.user);
      localStorage.setItem('firebaseIdToken', idToken);

      // ✅ Send token to backend
      await verifyTokenWithBackend(idToken);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: res.user.email,
          username: res.user.email.split('@')[0], // Default username from email
          role: 'customer',
        });
        redirectBasedOnRole('customer');
      } else {
        redirectBasedOnRole(userSnap.data().role || 'customer');
      }
    } catch (err) {
      console.error('Google Login Error:', err.message);
      alert('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    setLoading(true);
    try {
      // Ensure username is provided for signup
      if (isSignUp && !username) {
        alert('Please enter a username.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const idToken = await getFirebaseIdToken(userCredential.user);
      localStorage.setItem('firebaseIdToken', idToken);

      // ✅ Send token to backend
      await verifyTokenWithBackend(idToken);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username, // Use provided username for signup
        role: 'customer',
      });
      redirectBasedOnRole('customer');
    } catch (err) {
      console.error('Signup Error:', err.message);
      alert('Sign up failed. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      let emailToUse = loginInput;

      // If loginInput is not an email, try to find user by username
      if (!loginInput.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', loginInput));
        const snap = await getDocs(q);
        if (!snap.empty) {
          emailToUse = snap.docs[0].data().email;
        } else {
          alert('Username not found');
          setLoading(false);
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);

      const idToken = await getFirebaseIdToken(userCredential.user);
      localStorage.setItem('firebaseIdToken', idToken);

      // ✅ Send token to backend
      await verifyTokenWithBackend(idToken);

      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = docSnap.data()?.role || 'customer';
      redirectBasedOnRole(role);
    } catch (err) {
      console.error('Login Error:', err.message);
      alert('Login failed. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white border rounded-xl shadow-lg">
      {/* Logo and Website Name */}
      <div className="flex items-center justify-center mb-6">
        <img
          src="house.png" // Replace with your actual logo path
          alt="Your Logo" // Important for accessibility
          className="h-10 w-auto mr-2" // Adjust size as needed, mr-2 adds margin to the right of the logo
        />
        {/* Replace "Your Website Name" with your actual website name */}
        <h1 className="text-3xl font-bold text-gray-800">On-Demand Services</h1>
      </div>

      <h2 className="text-3xl font-semibold text-center mb-2 text-gray-800">
        Welcome!
      </h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        By continuing, I agree to the Company's{' '}
        <a href="#" className="text-purple-600 hover:underline">Privacy Statement</a> and{' '}
        <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
      </p>

      {/* Primary Option 1: Continue with Google (neutral style) */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3 mb-4 rounded-lg flex items-center justify-center border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" className="mr-2" />
        {loading ? 'Authenticating...' : 'Continue with Google'}
      </button>

      <div className="my-6 border-t text-center text-gray-500 relative">
        <span className="bg-white px-2 absolute left-1/2 -translate-x-1/2 -top-3">
          or
        </span>
      </div>

      {/* Primary Option 2: Login / Sign Up with Email (purple style) */}
      <button
        onClick={() => setShowEmailPasswordForm(!showEmailPasswordForm)}
        className="w-full py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white mb-4"
      >
        {showEmailPasswordForm ? 'Hide Email/Password' : 'Login / Sign Up'}
      </button>

      {/* Conditionally rendered Email/Password Form */}
      {showEmailPasswordForm && (
        <>
          <h2 className="text-2xl font-semibold text-center mt-6 mb-6 text-purple-700">
            {isSignUp ? 'Create Your Account' : 'Login with Email'}
          </h2>

          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          )}

          <input
            type="text"
            placeholder={isSignUp ? 'Email' : 'Email or Username'}
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={isSignUp ? email : loginInput}
            onChange={(e) =>
              isSignUp ? setEmail(e.target.value) : setLoginInput(e.target.value)
            }
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={isSignUp ? handleEmailSignup : handleEmailLogin}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>

          <p
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-center mt-4 text-purple-600 cursor-pointer hover:underline"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </p>
        </>
      )}
    </div>
  );
};

export default Login;