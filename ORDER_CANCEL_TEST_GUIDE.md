# Sipariş İptal Özelliği Test Rehberi

Bu rehber, yeni eklenen "Sipariş İptal Etme" özelliğini nasıl test edebileceğinizi adım adım açıklar.

## 📋 Ön Hazırlık

### 1. Firebase Firestore Rules'ı Güncelleme

**ÖNEMLİ:** Yeni eklenen iptal özelliğinin çalışması için Firebase Console'da Firestore Rules'ı güncellemeniz gerekiyor.

#### Adımlar:

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com/project/malikane-18a27/firestore adresine gidin
   - Giriş yapın

2. **Firestore Database > Rules sekmesine gidin**

3. **Mevcut rules'ı şununla değiştirin:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products koleksiyonu
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users koleksiyonu
    match /users/{userId} {
      function isAdmin() {
        return request.auth != null && request.auth.uid == 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';
      }
      
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Orders koleksiyonu - YENİ: Kullanıcılar kendi order'larını cancelled durumuna güncelleyebilir
    match /orders/{orderId} {
      function isAdmin() {
        return request.auth != null && request.auth.uid == 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';
      }
      
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      
      // YENİ: Kullanıcılar sadece kendi order'larını cancelled durumuna güncelleyebilir (ve sadece processing durumundan)
      allow update: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.userId && 
         request.resource.data.status == 'cancelled' &&
         resource.data.status == 'processing');
    }
    
    // Cart koleksiyonu
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reviews koleksiyonu
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **"Publish" butonuna tıklayın** - Rules'lar güncellenecek (birkaç saniye sürebilir)

---

## 🚀 Uygulamayı Çalıştırma

### Adım 1: Terminal'i Açın

Proje klasörünüze gidin:
```bash
cd /Users/cagdasaxoy/Documents/GitHub/cs308_group_26
```

### Adım 2: Uygulamayı Başlatın

```bash
npm start
```

**Not:** İlk kez çalıştırıyorsanız ve node_modules yoksa:
```bash
npm install --legacy-peer-deps
npm start
```

### Adım 3: Tarayıcıda Açın

Uygulama otomatik olarak açılacak. Eğer açılmazsa:
- Tarayıcınızda şu adrese gidin: **http://localhost:3000**

---

## 🧪 Test Senaryoları

### Senaryo 1: Yeni Bir Sipariş Oluşturma ve İptal Etme

#### 1.1. Giriş Yapın
- Sağ üst köşedeki "Login" butonuna tıklayın
- Mevcut bir hesabınızla giriş yapın veya yeni hesap oluşturun

#### 1.2. Ürün Sepete Ekleyin
- Ana sayfadan veya kategorilerden bir ürün seçin
- "Sepete Ekle" butonuna tıklayın
- Sepete birkaç ürün daha ekleyin

#### 1.3. Checkout (Ödeme) Sayfasına Gidin
- Sepet sayfasına gidin (sağ üst köşedeki sepet ikonuna tıklayın)
- "Checkout" veya "Ödeme" butonuna tıklayın

#### 1.4. Siparişi Tamamlayın
- Teslimat bilgilerini doldurun
- Ödeme bilgilerini doldurun (test için herhangi bir kart numarası yazabilirsiniz)
- "Siparişi Tamamla" butonuna tıklayın
- Sipariş başarılı mesajını görünce "Ana Sayfaya Dön" butonuna tıklayın

#### 1.5. Siparişi İptal Edin
- Sağ üst köşedeki kullanıcı menüsünden **"My Account"** veya **"Hesabım"** seçeneğine tıklayın
- Sol menüden **"Siparişlerim"** veya **"Orders"** seçeneğine tıklayın
- Oluşturduğunuz siparişi bulun (durum: "İşleniyor" - sarı badge)
- **"İptal Et"** butonuna tıklayın (kırmızı buton, sadece "İşleniyor" durumundaki siparişlerde görünür)
- Onay modalında **"Evet, İptal Et"** butonuna tıklayın
- Başarı mesajını görün
- Sipariş durumunun **"İptal Edildi"** (kırmızı badge) olarak değiştiğini kontrol edin

---

### Senaryo 2: Farklı Durumlardaki Siparişleri Kontrol Etme

#### 2.1. Sipariş Durumlarını Kontrol Edin
- "Siparişlerim" sayfasında farklı durumlardaki siparişleri görebilirsiniz:
  - **İşleniyor** (sarı badge) - İptal edilebilir ✅
  - **Yolda** (mavi badge) - İptal edilemez ❌
  - **Teslim Edildi** (yeşil badge) - İptal edilemez ❌
  - **İptal Edildi** (kırmızı badge) - İptal edilemez ❌

#### 2.2. İptal Butonunun Görünürlüğünü Test Edin
- Sadece **"İşleniyor"** durumundaki siparişlerde **"İptal Et"** butonu görünür olmalı
- Diğer durumlardaki siparişlerde bu buton görünmemeli

---

### Senaryo 3: Admin Panel'den Kontrol

#### 3.1. Admin Paneline Gidin
- Admin hesabıyla giriş yapın (UID: `kcopWa6L3AZ5BbeHCokV7uKD6Pd2`)
- URL'ye `/admin` ekleyerek admin paneline gidin

#### 3.2. İptal Edilen Siparişleri Görün
- Admin panelinde **"İptal Edildi"** istatistik kartını görün
- Siparişler tablosunda iptal edilen siparişleri görün
- Status dropdown'da **"İptal Edildi"** seçeneğini görün

---

## ✅ Kontrol Listesi

Test ederken şunları kontrol edin:

- [ ] Firebase Rules güncellendi mi?
- [ ] Uygulama başarıyla çalışıyor mu? (http://localhost:3000)
- [ ] Giriş yapabiliyor musunuz?
- [ ] Yeni sipariş oluşturabiliyor musunuz?
- [ ] "Siparişlerim" sayfasına gidebiliyor musunuz?
- [ ] "İşleniyor" durumundaki siparişlerde "İptal Et" butonu görünüyor mu?
- [ ] İptal butonuna tıklayınca onay modalı açılıyor mu?
- [ ] İptal işlemi başarıyla tamamlanıyor mu?
- [ ] Sipariş durumu "İptal Edildi" olarak değişiyor mu?
- [ ] İptal edilen siparişlerde "İptal Et" butonu artık görünmüyor mu?
- [ ] Ürün stokları geri ekleniyor mu? (Firebase Console'dan kontrol edin)
- [ ] Admin panelinde "İptal Edildi" istatistiği görünüyor mu?

---

## 🐛 Sorun Giderme

### Sorun: "İptal Et" butonu görünmüyor

**Çözüm:**
- Sipariş durumunun "processing" olduğundan emin olun
- Sayfayı yenileyin (F5)
- Browser console'u açın (F12) ve hata mesajlarını kontrol edin

### Sorun: İptal işlemi başarısız oluyor

**Çözüm:**
1. Firebase Console'da Firestore Rules'ın güncellendiğinden emin olun
2. Browser console'u açın (F12) ve hata mesajlarını kontrol edin
3. Kullanıcının siparişin sahibi olduğundan emin olun
4. Firebase Console > Firestore > orders collection'da siparişin `status` alanının "processing" olduğunu kontrol edin

### Sorun: Firebase Rules hatası alıyorum

**Çözüm:**
- Firebase Console'da Rules sekmesine gidin
- Rules'ları yukarıdaki kodla değiştirin
- "Publish" butonuna tıklayın
- Birkaç saniye bekleyin ve sayfayı yenileyin

### Sorun: Uygulama başlamıyor

**Çözüm:**
```bash
# Node modules'ı yeniden yükleyin
rm -rf node_modules
npm install --legacy-peer-deps

# Uygulamayı tekrar başlatın
npm start
```

---

## 📸 Beklenen Görünüm

### Siparişlerim Sayfası:
```
┌─────────────────────────────────────────────────────────┐
│ Siparişlerim                                            │
├──────────┬──────────┬──────────┬──────────┬───────────┤
│ Sipariş  │ Tarih    │ Durum    │ Toplam   │ İşlemler  │
├──────────┼──────────┼──────────┼──────────┼───────────┤
│ ORD-123  │ 15 Ocak  │ [İşleniyor] │ 500₺   │ [Detay]   │
│          │          │ (sarı)    │          │ [Fatura]  │
│          │          │           │          │ [İptal Et]│ ← Kırmızı buton
├──────────┼──────────┼──────────┼──────────┼───────────┤
│ ORD-124  │ 14 Ocak  │ [İptal]  │ 300₺     │ [Detay]   │
│          │          │ (kırmızı)│          │ [Fatura]  │
│          │          │           │          │           │ ← İptal butonu yok
└──────────┴──────────┴──────────┴──────────┴───────────┘
```

---

## 🎉 Başarı!

Tüm testler başarılıysa, sipariş iptal özelliği çalışıyor demektir! 

Herhangi bir sorunla karşılaşırsanız, browser console'daki (F12) hata mesajlarını kontrol edin veya Firebase Console'da Firestore verilerini inceleyin.

