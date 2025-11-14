# Malikane Electronics E-Ticaret Sitesi

Malikane Electronics için geliştirilmiş modern React tabanlı e-ticaret web uygulaması.

## 🚀 Özellikler

- 🛍️ Ürün kataloğu ve kategoriler
- 🔍 Ürün arama ve filtreleme
- 👤 Firebase Authentication ile kullanıcı girişi/kaydı
- 🛒 Sepet ve ödeme işlemleri
- 📱 Responsive tasarım
- 🌐 Çoklu dil desteği (Türkçe/İngilizce)

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Firebase projesi (Authentication ve Firestore için)

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


### 4. Firebase Yapılandırması

Firebase yapılandırmanız `src/firebaseConfig.js` dosyasında mevcut. Eğer farklı bir Firebase projesi kullanmak istiyorsanız, bu dosyayı düzenleyin:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... diğer ayarlar
};
```

### 5. Uygulamayı Çalıştırın

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
echo "SKIP_PREFLIGHT_CHECK=true" > .env

# 3. Uygulamayı başlat
npm start
```

## 📜 Mevcut Komutlar

### Geliştirme

```bash
npm start
```

Geliştirme sunucusunu başlatır. Tarayıcıda otomatik olarak açılır ve kod değişikliklerinde otomatik yenilenir.

### Production Build

```bash
npm run build
```

Production için optimize edilmiş build oluşturur. Build dosyaları `build/` klasörüne yazılır.

### Test

```bash
npm test
```

Test suite'ini çalıştırır.

## 🏗️ Proje Yapısı

```
malikanelectronics/
├── public/                 # Statik dosyalar
├── src/
│   ├── app/              # Uygulama mantığı
│   │   ├── data/         # Ürün verileri ve kategoriler
│   │   ├── slices/       # Redux slices
│   │   └── store.js      # Redux store
│   ├── assets/           # CSS, resimler ve diğer assetler
│   ├── component/        # React bileşenleri
│   ├── page/             # Sayfa bileşenleri
│   ├── firebaseConfig.js # Firebase yapılandırması
│   └── index.js          # Uygulama giriş noktası
├── package.json
└── README.md
```

## 🔐 Firebase Authentication

Uygulama Firebase Authentication kullanmaktadır. Kullanıcılar:

- Email/şifre ile kayıt olabilir
- Email/şifre ile giriş yapabilir
- Profil bilgilerini görüntüleyebilir
- Çıkış yapabilir

Firebase Console'da Authentication ve Firestore'u etkinleştirmeniz gerekir.

## 🌐 Deployment

### Production Build Oluşturma

```bash
npm run build
```

### Nginx Yapılandırması

SPA routing için Nginx yapılandırmanızda şu ayarları kullanın:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🐛 Sorun Giderme

### `npm install` Hataları

Eğer peer dependency hataları alırsanız:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Önemli:** Bu projede React 17 kullanıldığı için bazı paketler (react-messenger-customer-chat gibi) React 16 gerektirir. Bu nedenle `--legacy-peer-deps` flag'i kullanılmalıdır.

### Build Hataları

OpenSSL legacy provider hatası alırsanız, `package.json`'daki script'ler zaten `NODE_OPTIONS=--openssl-legacy-provider` ile yapılandırılmıştır.

### babel-jest Versiyon Uyarısı

Eğer `babel-jest` versiyon uyarısı alırsanız, `.env` dosyasında `SKIP_PREFLIGHT_CHECK=true` olduğundan emin olun. Bu uyarı uygulamanın çalışmasını engellemez.

### Firebase Bağlantı Hataları

- Firebase Console'da projenizin aktif olduğundan emin olun
- `firebaseConfig.js` dosyasındaki yapılandırmanın doğru olduğunu kontrol edin
- Firestore ve Authentication servislerinin etkin olduğunu doğrulayın

## 📝 Notlar

- Proje React 17 ve Firebase 8.x kullanmaktadır
- `react-scripts` 4.0.3 versiyonu kullanılmaktadır
- Legacy peer dependencies için `--legacy-peer-deps` flag'i ile yükleme yapılmalıdır
- `.env` dosyası manuel olarak oluşturulmalıdır (`SKIP_PREFLIGHT_CHECK=true`)

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel bir projedir.

## 📞 İletişim

Sorularınız için lütfen iletişime geçin.

---

**Önemli Hatırlatma:** İlk kurulumda mutlaka `npm install --legacy-peer-deps` komutunu kullanın ve `.env` dosyasını oluşturmayı unutmayın!
