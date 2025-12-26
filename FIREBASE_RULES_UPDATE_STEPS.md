# Firebase Rules Güncelleme Adımları (Mac)

## 🎯 Amaç
Sipariş iptal özelliğinin çalışması için Firebase Firestore Rules'ı güncellemek.

## 📋 Adım Adım Rehber

### Adım 1: Firebase Console'a Giriş Yapın

1. **Tarayıcınızda şu adrese gidin:**
   ```
   https://console.firebase.google.com/project/malikane-18a27/firestore/rules
   ```

2. **Giriş yapın** (Google hesabınızla)

---

### Adım 2: Firestore Rules Sayfasını Açın

1. Sol menüden **"Firestore Database"** seçeneğine tıklayın
2. Üstteki sekmelerden **"Rules"** sekmesine tıklayın
3. Şu anda mevcut rules'ları göreceksiniz

---

### Adım 3: Rules'ı Kopyalayın

**Aşağıdaki kodun tamamını kopyalayın:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products koleksiyonu - Herkes okuyabilir, yazma için authentication gerekli
    match /products/{productId} {
      // Herkes ürünleri okuyabilir
      allow read: if true;
      
      // Yazma için sadece authenticated kullanıcılar (ileride admin kontrolü eklenebilir)
      // NOT: Script çalıştırmak için geçici olarak 'allow write: if true;' yapın
      // Ürünler yüklendikten sonra tekrar 'allow write: if request.auth != null;' yapın
      allow write: if request.auth != null;
    }
    
    // Users koleksiyonu - Kullanıcılar sadece kendi verilerini okuyup yazabilir
    match /users/{userId} {
      // Admin UID (admin tüm kullanıcıları görebilir ve güncelleyebilir)
      function isAdmin() {
        return request.auth != null && request.auth.uid == 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';
      }
      
      // Kullanıcılar kendi dokümanlarını okuyabilir, admin tüm kullanıcıları okuyabilir
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      // Kullanıcılar kendi dokümanlarını oluşturabilir
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Kullanıcılar kendi dokümanlarını güncelleyebilir, admin tüm kullanıcıları güncelleyebilir
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Orders koleksiyonu
    match /orders/{orderId} {
      // Admin UID (admin tüm order'ları görebilir)
      function isAdmin() {
        return request.auth != null && request.auth.uid == 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';
      }
      
      // Kullanıcılar kendi order'larını okuyabilir, admin tüm order'ları okuyabilir
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || isAdmin());
      
      // Kullanıcılar kendi order'larını oluşturabilir (checkout sırasında)
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      
      // YENİ: Admin order'ları güncelleyebilir, kullanıcılar sadece kendi order'larını cancelled durumuna güncelleyebilir
      allow update: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.userId && 
         request.resource.data.status == 'cancelled' &&
         resource.data.status == 'processing');
    }
    
    // Cart koleksiyonu (gelecekte kullanılacak)
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reviews/Ratings koleksiyonu (gelecekte kullanılacak)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Diğer tüm koleksiyonlar için varsayılan: Reddet
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### Adım 4: Rules'ı Yapıştırın

1. Firebase Console'daki Rules editöründe **mevcut tüm kodu seçin** (`Cmd + A`)
2. **Silin** (`Delete` veya `Backspace`)
3. **Yukarıdaki yeni kodu yapıştırın** (`Cmd + V`)

---

### Adım 5: Rules'ı Yayınlayın (Publish)

1. Sağ üstteki **"Publish"** (Yayınla) butonuna tıklayın
2. Onay mesajını bekleyin
3. Birkaç saniye içinde rules güncellenecek

**ÖNEMLİ:** Rules'ın yayınlanması 10-30 saniye sürebilir. Sabırla bekleyin.

---

### Adım 6: Test Edin

1. **Web uygulamanıza dönün** (`http://localhost:3000/profile`)
2. **Sayfayı yenileyin** (`Cmd + R`)
3. **"İptal Et" butonuna tekrar tıklayın**
4. Artık hata almamalısınız! ✅

---

## ✅ Başarı Kontrolü

Rules başarıyla güncellendiyse:
- ✅ "İptal Et" butonuna tıklayınca onay modalı açılır
- ✅ "Evet, İptal Et" dediğinizde sipariş iptal edilir
- ✅ Sipariş durumu "İptal Edildi" olarak değişir
- ✅ Hata mesajı görünmez

---

## 🐛 Sorun Giderme

### Sorun: "Publish" butonu çalışmıyor
**Çözüm:** 
- Sayfayı yenileyin ve tekrar deneyin
- Tarayıcı cache'ini temizleyin

### Sorun: Rules yayınlandı ama hala hata alıyorum
**Çözüm:**
- 30 saniye bekleyin (rules'ın yayılması zaman alabilir)
- Web uygulamasında sayfayı hard refresh yapın (`Cmd + Shift + R`)
- Tarayıcıyı kapatıp tekrar açın

### Sorun: Syntax hatası alıyorum
**Çözüm:**
- Rules'ı tekrar kontrol edin
- Tırnak işaretlerinin doğru olduğundan emin olun
- `firestore.rules` dosyasındaki kodu kullanın

---

## 📸 Görsel Rehber

1. **Firebase Console:** https://console.firebase.google.com/project/malikane-18a27/firestore/rules
2. **Rules sekmesi:** Sol menüden "Firestore Database" → Üstte "Rules"
3. **Editör:** Ortada büyük bir kod editörü göreceksiniz
4. **Publish butonu:** Sağ üstte mavi "Publish" butonu

---

## 🎉 Tamamlandı!

Rules güncellendikten sonra sipariş iptal özelliği tam olarak çalışacak!

