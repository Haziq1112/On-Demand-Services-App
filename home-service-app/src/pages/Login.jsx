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
          username: res.user.email.split('@')[0],
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const idToken = await getFirebaseIdToken(userCredential.user);
      localStorage.setItem('firebaseIdToken', idToken);

      // ✅ Send token to backend
      await verifyTokenWithBackend(idToken);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
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
      <h2 className="text-3xl font-semibold text-center mb-6 text-purple-700">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>

      {isSignUp && (
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        className="text-center mt-4 text-blue-600 cursor-pointer hover:underline"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </p>

      <div className="my-6 border-t text-center text-gray-500 relative">
        <span className="bg-white px-2 absolute left-1/2 -translate-x-1/2 -top-3">
          or
        </span>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-lg"
      >
        {loading ? 'Authenticating...' : 'Continue with Google'}
      </button>
    </div>
  );
};

export default Login;
