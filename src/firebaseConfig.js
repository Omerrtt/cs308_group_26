import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// Firebase Conf iguration
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();

