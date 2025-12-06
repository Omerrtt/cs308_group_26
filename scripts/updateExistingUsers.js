// Mevcut kullanıcılara Orders, cart, addresses field'larını ekleyen script
// Bu script'i çalıştırmak için:
// 1. Node.js ile: node scripts/updateExistingUsers.js
// 2. Veya admin sayfasından çalıştırılabilir

const firebase = require('firebase/app');
require('firebase/firestore');

// Firebase Configuration
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

const db = firebase.firestore();

const updateExistingUsers = async () => {
  try {
    console.log('Kullanıcılar güncelleniyor...');
    
    // Tüm kullanıcıları al
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('Hiç kullanıcı bulunamadı.');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Her kullanıcıyı kontrol et ve güncelle
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Eksik field'ları kontrol et ve ekle
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
      
      if (needsUpdate) {
        const userRef = db.collection('users').doc(doc.id);
        batch.update(userRef, updates);
        batchCount++;
        updatedCount++;
        
        // Batch limit'e ulaşırsa commit et
        if (batchCount >= BATCH_LIMIT) {
          batch.commit();
          batchCount = 0;
          console.log(`Güncellendi: ${updatedCount} kullanıcı...`);
        }
      } else {
        skippedCount++;
      }
    });
    
    // Kalan batch'i commit et
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('\n✅ Güncelleme tamamlandı!');
    console.log(`📊 Güncellenen: ${updatedCount} kullanıcı`);
    console.log(`⏭️  Atlanan: ${skippedCount} kullanıcı (zaten güncel)`);
    console.log(`❌ Hata: ${errorCount} kullanıcı`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
if (require.main === module) {
  updateExistingUsers();
}

module.exports = updateExistingUsers;

