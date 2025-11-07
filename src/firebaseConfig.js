import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase config kontrolü
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId;
};

let app;
let auth;
let db;

try {
  if (!isFirebaseConfigValid()) {
    console.warn('Firebase environment variables eksik! Lütfen .env dosyasına Firebase config değerlerini ekleyin.');
    // Firebase config eksikse, uygulama çalışmaya devam edebilir ama Firebase özellikleri çalışmayacak
    // Geçici olarak dummy değerlerle initialize ediyoruz (sadece uygulamanın çökmesini önlemek için)
    app = initializeApp({
      apiKey: "dummy-api-key",
      authDomain: "dummy-project.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    });
    auth = getAuth(app);
    db = getFirestore(app);
    console.warn('Firebase dummy config ile başlatıldı. Firebase özellikleri çalışmayacak!');
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization hatası:', error);
  // Hata durumunda bile uygulamanın çalışması için dummy değerler
  app = initializeApp({
    apiKey: "dummy-api-key",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  });
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };