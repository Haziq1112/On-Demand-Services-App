// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7d6BUEfPygvV4mIn7a4hwwuaXZx0QTlc",
  authDomain: "service-app-1af51.firebaseapp.com",
  projectId: "service-app-1af51",
  storageBucket: "service-app-1af51.firebasestorage.app",
  messagingSenderId: "746970983643",
  appId: "1:746970983643:web:cbfd74cb40e380bffc70fe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);