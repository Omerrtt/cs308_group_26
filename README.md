# Malikane Electronics E-Ticaret Sitesi

Malikane Electronics için geliştirilmiş modern React tabanlı e-ticaret web uygulaması.

## 🚀 Özellikler

- 🛍️ Ürün kataloğu ve kategoriler
- 🔍 Ürün arama ve filtreleme
- 👤 Firebase Authentication ile kullanıcı girişi/kaydı
- 🛒 Sepet ve ödeme işlemleri
- 📱 Responsive tasarım

## 🔧 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd cs308_group_26
```

### 2. Bağımlılıkları Yükleyin

**Önemli:** Bu proje React 17 kullanmaktadır ve bazı paketler React 16 gerektirdiği için `--legacy-peer-deps` flag'i ile yükleme yapmanız gerekmektedir.

```bash
npm install --legacy-peer-deps
```


### 3. Uygulamayı Çalıştırın

Geliştirme modunda çalıştırmak için:

```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

## ⚡ İlk Çalıştırma Özeti

İlk kez çalıştırmak için şu adımları takip edin:

```bash
# 1. Bağımlılıkları yükle
npm install --legacy-peer-deps

# 2. .env dosyası oluştur
# echo "SKIP_PREFLIGHT_CHECK=true" > .env

# 3. Uygulamayı başlat
npm start
```

## 📜 Mevcut Komutlar

### Geliştirme

```bash
npm start
```

Geliştirme sunucusunu başlatır. Tarayıcıda otomatik olarak açılır ve kod değişikliklerinde otomatik yenilenir.



Firebase Console'da Authentication ve Firestore'u etkinleştirmeniz gerekir.


### babel-jest Versiyon Uyarısı

Eğer `babel-jest` versiyon uyarısı alırsanız, `.env` dosyasında `SKIP_PREFLIGHT_CHECK=true` olduğundan emin olun. Bu uyarı uygulamanın çalışmasını engellemez.

### Firebase Bağlantı Hataları

- Firebase Console'da projenizin aktif olduğundan emin olun
- `firebaseConfig.js` dosyasındaki yapılandırmanın doğru olduğunu kontrol edin
- Firestore ve Authentication servislerinin etkin olduğunu doğrulayın

