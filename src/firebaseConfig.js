import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration - Gerçek bilgiler
const firebaseConfig = {
  apiKey: "AIzaSyDClfGg2ANXmXGM2L4vGtYwNYIjIH0kLo8",
  authDomain: "malikane-18a27.firebaseapp.com",
  projectId: "malikane-18a27",
  storageBucket: "malikane-18a27.firebasestorage.app",
  messagingSenderId: "842152348833",
  appId: "1:842152348833:web:06e93edeb76132b3e8b4e0",
  measurementId: "G-HGZSJLDLNV"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);