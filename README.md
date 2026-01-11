# Malikane Electronics E-Ticaret Sitesi

Malikane Electronics; modern, mobil uyumlu (responsive) ve kullanıcı deneyimini ön planda tutan kapsamlı bir e-ticaret platformudur. React 17 altyapısı üzerine inşa edilen bu proje, veri yönetimi ve kimlik doğrulama süreçlerinde Firebase ekosistemi ile tam entegre çalışmaktadır.

## 🚀 Temel Özellikler

- 🛍️ Ürün kataloğu ve kategoriler
- 🔍 Ürün arama ve filtreleme
- 👤 Firebase Authentication ile kullanıcı girişi/kaydı
- 🛒 Sepet ve ödeme işlemleri
- 📱 Responsive tasarım
- 🎨 Modern ve sade arayüz

## 🔧 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd cs308_group_26
```

### 2. Bağımlılıkları Yükleyin

**Önemli:** Bu proje React 17 kullanmaktadır ve bazı paketler React 16 gerektirdiği için `--legacy-peer-deps` flag'i ile yükleme yapmanız gerekmektedir.

**Windows kullanıcıları için:**
```bash
npm install cross-env --legacy-peer-deps
```

**Mac/Linux kullanıcıları için:**
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

**Windows:**
```bash
# 1. Bağımlılıkları yükle (cross-env ile)
npm install cross-env --legacy-peer-deps

# 2. .env dosyası oluştur
# echo SKIP_PREFLIGHT_CHECK=true > .env

# 3. Uygulamayı başlat
npm start
```

**Mac/Linux:**
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

## 🔥 Firebase Yapılandırması
Uygulamanın sorunsuz çalışabilmesi için:

Firebase Console üzerinden:

Authentication

Firestore Database

servislerinin aktif olması gerekir.