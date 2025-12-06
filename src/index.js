import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome/css/font-awesome.min.css'
import MessengerCustomerChat from 'react-messenger-customer-chat';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { auth, db } from './firebaseConfig';
import { register, logout } from './app/slices/user';
import { loadProductsFromFirebase, clearCart, setCart } from './app/slices/products';
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
      let userData = null;
      
      if (docSnap.exists) {
        userData = docSnap.data();
        userName = userData.name || user.displayName || 'Müşteri';
        
               // Eksik field'ları kontrol et ve ekle (eski kullanıcılar için)
               const updates = {};
               let needsUpdate = false;
               
               if (!userData.hasOwnProperty('orders')) {
                 updates.orders = [];
                 needsUpdate = true;
               }
               
               if (!userData.hasOwnProperty('cart')) {
                 updates.cart = [];
                 needsUpdate = true;
               }
               
               if (!userData.hasOwnProperty('addresses')) {
                 updates.addresses = [];
                 needsUpdate = true;
               }
               
               if (!userData.hasOwnProperty('invoices')) {
                 updates.invoices = [];
                 needsUpdate = true;
               }
        
        // Eksik field'ları güncelle
        if (needsUpdate) {
          try {
            await docRef.update(updates);
            console.log('Kullanıcı profili güncellendi:', user.uid);
            // Güncellemeden sonra userData'yı da güncelle
            if (updates.cart !== undefined) userData.cart = updates.cart;
            if (updates.orders !== undefined) userData.orders = updates.orders;
            if (updates.addresses !== undefined) userData.addresses = updates.addresses;
            if (updates.invoices !== undefined) userData.invoices = updates.invoices;
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
      
      // Cart merge işlemi: Redux cart + Firebase cart
      try {
        // Redux store'daki mevcut cart'ı al
        const reduxCart = store.getState().products.carts || [];
        console.log('🛒 Redux cart:', reduxCart.length, 'ürün');
        
        // Firebase'deki cart'ı al
        const firebaseCart = (userData && userData.cart) ? userData.cart : [];
        console.log('🔥 Firebase cart:', firebaseCart.length, 'ürün');
        
        // İki cart'ı birleştir - önce Firebase cart'ı temel al
        const mergedCart = firebaseCart.map(item => ({
          id: item.id,
          originalId: item.originalId || item.id,
          title: item.title,
          price: item.price,
          img: item.img || item.image,
          quantity: item.quantity || 1
        }));
        
        // Redux cart'taki her ürünü kontrol et ve birleştir
        reduxCart.forEach(reduxItem => {
          const productId = reduxItem.originalId || reduxItem.id;
          const existingItemIndex = mergedCart.findIndex(
            item => (item.originalId || item.id) === productId
          );
          
          if (existingItemIndex >= 0) {
            // Aynı ürün varsa, quantity'leri topla
            const existingQuantity = mergedCart[existingItemIndex].quantity || 1;
            const reduxQuantity = reduxItem.quantity || 1;
            const newQuantity = existingQuantity + reduxQuantity;
            mergedCart[existingItemIndex].quantity = newQuantity;
            console.log(`✅ Ürün birleştirildi: ${reduxItem.title} (Firebase: ${existingQuantity} + Redux: ${reduxQuantity} = ${newQuantity})`);
          } else {
            // Yeni ürün (sadece Redux'ta var), ekle
            mergedCart.push({
              id: reduxItem.id,
              originalId: reduxItem.originalId || reduxItem.id,
              title: reduxItem.title,
              price: reduxItem.price,
              img: reduxItem.img || reduxItem.image,
              quantity: reduxItem.quantity || 1
            });
            console.log(`➕ Yeni ürün eklendi (Redux'tan): ${reduxItem.title}`);
          }
        });
        
        console.log('🔄 Birleştirilmiş cart:', mergedCart.length, 'ürün');
        
        // Birleştirilmiş cart'ı Redux'a ve Firebase'e kaydet
        if (mergedCart.length > 0 || reduxCart.length > 0 || firebaseCart.length > 0) {
          store.dispatch(setCart(mergedCart));
          console.log('✅ Cart birleştirme tamamlandı ve kaydedildi');
        }
      } catch (cartError) {
        console.error('❌ Cart birleştirme hatası:', cartError);
        // Hata olsa bile devam et
      }
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
