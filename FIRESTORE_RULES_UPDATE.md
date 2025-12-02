# Firestore Güvenlik Kurallarını Güncelleme Rehberi

Bu rehber, kullanıcıları toplu olarak güncellemek için Firestore güvenlik kurallarını nasıl güncelleyeceğinizi açıklar.

## Yöntem 1: Firebase Console'dan Güncelleme (Hızlı)

### Adımlar:

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com/project/malikane-18a27/firestore/rules

2. **Mevcut kuralları bulun ve aşağıdaki kuralı ekleyin:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      // Kullanıcılar kendi dokümanlarını okuyabilir
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Kullanıcılar kendi dokümanlarını oluşturabilir ve güncelleyebilir
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // ⚠️ GEÇİCİ: Admin sayfasından tüm kullanıcıları güncellemek için
      // Bu kuralı sadece toplu güncelleme yaparken kullanın, sonra kaldırın
      allow update: if request.auth != null;
      
      // Orders subcollection
      match /orders/{orderId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Invoices subcollection
      match /invoices/{invoiceId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Diğer collection'lar için varsayılan kurallar
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **"Publish" butonuna tıklayın**

4. **Admin sayfasından kullanıcıları güncelleyin**

5. **İşlem tamamlandıktan sonra, güvenlik için şu satırı kaldırın:**
   ```javascript
   // Bu satırı kaldırın:
   allow update: if request.auth != null;
   ```
   
   Ve sadece şunu bırakın:
   ```javascript
   allow update: if request.auth != null && request.auth.uid == userId;
   ```

## Yöntem 2: Firebase CLI ile Güncelleme (Kalıcı)

### Önkoşullar:
- Firebase CLI kurulu olmalı: `npm install -g firebase-tools`
- Firebase'e giriş yapılmış olmalı: `firebase login`

### Adımlar:

1. **Proje kök dizininde `firestore.rules` dosyası oluşturuldu** (zaten var)

2. **Firebase CLI ile deploy edin:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Admin sayfasından kullanıcıları güncelleyin**

4. **İşlem tamamlandıktan sonra, `firestore.rules` dosyasındaki geçici kuralı kaldırın:**
   ```javascript
   // Bu satırı kaldırın:
   allow update: if request.auth != null;
   ```

5. **Tekrar deploy edin:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Güvenlik Notları

⚠️ **ÖNEMLİ:** 
- `allow update: if request.auth != null;` kuralı tüm authenticated kullanıcıların tüm kullanıcı dokümanlarını güncellemesine izin verir.
- Bu kural sadece toplu güncelleme yaparken geçici olarak kullanılmalıdır.
- İşlem tamamlandıktan sonra mutlaka kaldırılmalıdır.
- Production ortamında bu kuralı kullanmadan önce dikkatli düşünün.

## Alternatif Çözüm

Eğer güvenlik kurallarını değiştirmek istemiyorsanız, her kullanıcı giriş yaptığında otomatik olarak eksik field'lar ekleniyor (`src/index.js` dosyasında). Bu yöntem daha güvenlidir ama tüm kullanıcıların bir kez giriş yapması gerekir.

