import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome/css/font-awesome.min.css'
import MessengerCustomerChat from 'react-messenger-customer-chat';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { auth, db } from './firebaseConfig';
import { register, logout } from './app/slices/user';
import { loadProductsFromFirebase, clearCart } from './app/slices/products';
// import Bootstrap CSS first
import 'bootstrap/dist/css/bootstrap.min.css';
// import Custom Css - Bootstrap'ten sonra yüklensin
import "./assets/css/style.css"
import "./assets/css/color.css"
import "./assets/css/responsive.css"
import "./assets/css/animate.min.css"

// process polyfill (bazı kütüphaneler için gerekli)
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
    window.process = {
        env: {
            NODE_ENV: 'development'
        }
    };
}

// Sayfa yüklenirken hemen auth state'i localStorage'dan yükle
const initializeAuthFromStorage = () => {
  try {
    const storedAuth = JSON.parse(localStorage.getItem('cs308_auth_state') || 'null');
    
    // Eğer localStorage'da geçerli auth state varsa, hemen Redux'u güncelle
    if (storedAuth && storedAuth.status && storedAuth.user) {
      // 24 saatten eski değilse kullan
      if (storedAuth.timestamp && Date.now() - storedAuth.timestamp < 24 * 60 * 60 * 1000) {
        store.dispatch(register({ 
          user: storedAuth.user.name || 'Müşteri', 
          email: storedAuth.user.email || '', 
          pass: '' 
        }));
        console.log('Auth state localStorage\'dan yüklendi');
      } else {
        // Eski auth state - temizle
        localStorage.removeItem('cs308_auth_state');
      }
    }
  } catch (error) {
    console.error('Auth state yükleme hatası:', error);
  }
};

// İlk yüklemede hemen localStorage'dan yükle (Firebase hazır olmadan önce)
initializeAuthFromStorage();

// Firebase Auth State Listener - Kullanıcı giriş durumunu takip et
// İlk çağrıda Firebase auth state'i doğrula ve güncelle
let isFirstAuthCheck = true;
auth.onAuthStateChanged(async (user) => {
  // İlk kontrol - Firebase auth state'i doğrula
  if (isFirstAuthCheck) {
    isFirstAuthCheck = false;
    
    // Eğer Firebase'de user yoksa ama localStorage'da varsa, localStorage'ı temizle
    if (!user) {
      const storedAuth = JSON.parse(localStorage.getItem('cs308_auth_state') || 'null');
      if (storedAuth && storedAuth.status) {
        localStorage.removeItem('cs308_auth_state');
        store.dispatch(logout());
        store.dispatch(clearCart());
      }
      return;
    }
  }
  
  if (user) {
    // Kullanıcı giriş yapmış - Firebase'den doğrula ve güncelle
    try {
      // Firestore'dan kullanıcı bilgilerini al
      const docRef = db.collection('users').doc(user.uid);
      const docSnap = await docRef.get();
      
      let userName = 'Müşteri';
      if (docSnap.exists) {
        const data = docSnap.data();
        userName = data.name || user.displayName || 'Müşteri';
        
               // Eksik field'ları kontrol et ve ekle (eski kullanıcılar için)
               const updates = {};
               let needsUpdate = false;
               
               if (!data.hasOwnProperty('orders')) {
                 updates.orders = [];
                 needsUpdate = true;
               }
               
               if (!data.hasOwnProperty('cart')) {
                 updates.cart = [];
                 needsUpdate = true;
               }
               
               if (!data.hasOwnProperty('addresses')) {
                 updates.addresses = [];
                 needsUpdate = true;
               }
               
               if (!data.hasOwnProperty('invoices')) {
                 updates.invoices = [];
                 needsUpdate = true;
               }
        
        // Eksik field'ları güncelle
        if (needsUpdate) {
          try {
            await docRef.update(updates);
            console.log('Kullanıcı profili güncellendi:', user.uid);
          } catch (updateError) {
            console.warn('Kullanıcı profili güncellenirken hata:', updateError);
          }
        }
      } else {
        userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Müşteri');
      }
      
      // Redux store'u güncelle (localStorage'a da kaydedilecek)
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
    store.dispatch(clearCart()); // Sepeti temizle
  }
});

// Uygulama başlatıldığında Firebase'den ürünleri yükle
store.dispatch(loadProductsFromFirebase());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MessengerCustomerChat pageId="105124045291751" appId="385408413223722" />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
