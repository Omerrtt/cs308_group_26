# Firebase'e Ürün Verilerini Yükleme Rehberi

Bu rehber, `allProducts.json` dosyasındaki ürün verilerini Firebase Firestore'a yüklemek için iki farklı yöntem sunar.

## Yöntem 1: Browser Console'dan Yükleme (Önerilen - En Kolay)

Bu yöntem en basit ve hızlı yöntemdir. Firebase Admin SDK'ya ihtiyaç duymaz.

### Adımlar:

1. **Firebase Console'da Firestore Database'i oluştur:**
   - https://console.firebase.google.com/project/malikane-18a27/firestore adresine git
   - "Create database" butonuna tıkla
   - Test mode veya Production mode seç (test mode daha kolay başlamak için)
   - Location seç (örn: europe-west1)

2. **Firestore Security Rules'ı güncelle (Test için):**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{document=**} {
         allow read, write: if true; // Test için - Production'da değiştirilmeli
       }
     }
   }
   ```

3. **Web sitesini çalıştır:**
   ```bash
   npm start
   ```

4. **Browser Console'u aç (F12) ve şu kodu çalıştır:**
   ```javascript
   // Firebase ve allProducts.json'ı import et
   const { db } = require('./src/firebaseConfig');
   const allProducts = require('./src/app/data/allProducts.json');
   
   // Yükleme fonksiyonu
   async function uploadProducts() {
     console.log(`Toplam ${allProducts.length} ürün yüklenecek...`);
     let uploadedCount = 0;
     const batchSize = 500;
     
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
       console.log(`Yüklendi: ${uploadedCount}/${allProducts.length} (${((uploadedCount/allProducts.length)*100).toFixed(2)}%)`);
     }
     
     console.log(`✅ Tamamlandı! ${uploadedCount} ürün yüklendi.`);
   }
   
   uploadProducts();
   ```

   **NOT:** Browser console'da direkt çalıştırmak için, React uygulaması içinde bir admin sayfası oluşturmak daha iyi olabilir.

## Yöntem 2: Node.js Script ile Yükleme (Firebase Admin SDK)

Bu yöntem için Firebase Admin SDK'ya ihtiyaç vardır.

### Adımlar:

1. **Firebase Admin SDK'yı yükle:**
   ```bash
   npm install firebase-admin
   ```

2. **Firebase Console'dan Service Account Key indir:**
   - https://console.firebase.google.com/project/malikane-18a27/settings/serviceaccounts/adminsdk adresine git
   - "Generate new private key" butonuna tıkla
   - İndirilen JSON dosyasını `firebase-service-account-key.json` olarak proje root'una kaydet

3. **Script'i çalıştır:**
   ```bash
   node scripts/uploadProductsToFirebase.js
   ```

## Yöntem 3: React Uygulaması İçinde Admin Sayfası (En Pratik)

Bir admin sayfası oluşturup oradan yükleme yapabilirsin.

### Adımlar:

1. `src/page/admin/upload-products.js` dosyası oluştur (opsiyonel - istersen oluşturabilirim)
2. Bu sayfada bir buton ekle
3. Butona tıklandığında Firebase'e yükleme yap

## Önemli Notlar:

- **Firestore Limitleri:**
  - Batch başına maksimum 500 işlem
  - Günlük yazma limiti: 20,000 (ücretsiz plan)
  - ~6800 ürün için yaklaşık 14 batch gerekir

- **Güvenlik:**
  - Production'da Firestore Security Rules'ı mutlaka güncelle
  - Sadece authenticated admin kullanıcıların yazma yapmasına izin ver

- **Cache:**
  - Ürünler yüklendikten sonra, web sitesi Firebase'den otomatik olarak çekecek
  - İlk yüklemede JSON'dan, sonrasında Firebase'den gelecek

## Sorun Giderme:

- **"Permission denied" hatası:** Firestore Security Rules'ı kontrol et
- **"Collection not found" hatası:** Firestore database'in oluşturulduğundan emin ol
- **Yavaş yükleme:** Batch size'ı azalt (örn: 250)

