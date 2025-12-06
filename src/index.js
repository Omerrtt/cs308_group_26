import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome/css/font-awesome.min.css'
import MessengerCustomerChat from 'react-messenger-customer-chat';

import App from './App';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { auth, db } from './firebaseConfig';
import { register, logout } from './app/slices/user';

// import Bootstrap CSS first
import 'bootstrap/dist/css/bootstrap.min.css';

// import Custom Css - Bootstrap'ten sonra yüklensin
import "./assets/css/style.css"
import "./assets/css/color.css"
import "./assets/css/responsive.css"
import "./assets/css/animate.min.css"

// Firebase Auth State Listener - Kullanıcı giriş durumunu takip et
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Kullanıcı giriş yapmış
    try {
      // Firestore'dan kullanıcı bilgilerini al
      const docRef = db.collection('users').doc(user.uid);
      const docSnap = await docRef.get();
      
      let userName = 'Müşteri';
      if (docSnap.exists) {
        const data = docSnap.data();
        userName = data.name || user.displayName || 'Müşteri';
      } else {
        userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Müşteri');
      }
      
      // Redux store'u güncelle
      store.dispatch(register({ 
        user: userName, 
        email: user.email || '', 
        pass: '' 
      }));
    } catch (error) {
      console.error('Firebase auth state listener error:', error);
      // Fallback: sadece email'den kullanıcı adı oluştur
      const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Müşteri');
      store.dispatch(register({ 
        user: userName, 
        email: user.email || '', 
        pass: '' 
      }));
    }
  } else {
    // Kullanıcı çıkış yapmış
    store.dispatch(logout());
  }
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MessengerCustomerChat pageId="105124045291751" appId="385408413223722" />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
