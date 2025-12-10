// Basit versiyon - Firebase Admin SDK olmadan, client-side Firebase kullanarak
// Bu script'i browser console'da çalıştırabilirsin veya React uygulaması içinde kullanabilirsin

// NOT: Bu script'i kullanmak için:
// 1. Firebase Console'da Firestore Database'i oluştur
// 2. "products" collection'ını oluştur
// 3. Bu script'i browser console'da çalıştır veya bir admin sayfası oluştur

const uploadProductsToFirebase = async () => {
  const allProducts = require('../src/app/data/allProducts.json');
  const { db } = require('../src/firebaseConfig');
  
  console.log(`Toplam ${allProducts.length} ürün yüklenecek...`);
  
  let uploadedCount = 0;
  let errorCount = 0;
  const batchSize = 500;
  
  try {
    // Batch işlemleri için
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = db.batch();
      const batchProducts = allProducts.slice(i, i + batchSize);
      
      batchProducts.forEach((product) => {
        const productRef = db.collection('products').doc(product.id?.toString() || `product_${i}`);
        batch.set(productRef, {
          ...product,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      uploadedCount += batchProducts.length;
      console.log(`Yüklendi: ${uploadedCount}/${allProducts.length}`);
    }
    
    console.log(`✅ Tamamlandı! ${uploadedCount} ürün yüklendi.`);
  } catch (error) {
    console.error('❌ Hata:', error);
  }
};

// Export et (eğer module system kullanıyorsan)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = uploadProductsToFirebase;
}

