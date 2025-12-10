const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK için service account key gerekli
// Önce Firebase Console'dan service account key indirmen gerekiyor
// https://console.firebase.google.com/project/malikane-18a27/settings/serviceaccounts/adminsdk

// Service account key dosyasının yolunu buraya ekle
const serviceAccount = require('../firebase-service-account-key.json');

// Firebase Admin'i başlat
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// allProducts.json dosyasını oku
const allProductsPath = path.resolve(__dirname, '../src/app/data/allProducts.json');
const allProducts = JSON.parse(fs.readFileSync(allProductsPath, 'utf8'));

console.log(`Toplam ${allProducts.length} ürün yüklenecek...`);

// Batch işlemleri için (Firestore limit: 500 işlem/batch)
const batchSize = 500;
let uploadedCount = 0;
let errorCount = 0;

async function uploadProducts() {
  try {
    // Önce mevcut products collection'ını temizle (opsiyonel)
    console.log('Mevcut ürünler siliniyor...');
    const existingProducts = await db.collection('products').get();
    const deleteBatch = db.batch();
    existingProducts.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log('Mevcut ürünler silindi.');

    // Ürünleri batch'ler halinde yükle
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = db.batch();
      const batchProducts = allProducts.slice(i, i + batchSize);
      
      batchProducts.forEach((product, index) => {
        const productRef = db.collection('products').doc(product.id?.toString() || `product_${i + index}`);
        batch.set(productRef, {
          ...product,
          // Firestore'da timestamp ekle
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      uploadedCount += batchProducts.length;
      console.log(`Yüklendi: ${uploadedCount}/${allProducts.length} (${((uploadedCount/allProducts.length)*100).toFixed(2)}%)`);
    }

    console.log(`\n✅ Başarıyla tamamlandı!`);
    console.log(`   Toplam yüklenen: ${uploadedCount} ürün`);
    console.log(`   Hata sayısı: ${errorCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

uploadProducts();

