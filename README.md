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
cd malikanelectronics
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

**Not:** Eğer peer dependency hataları alırsanız, proje `.npmrc` dosyasında `legacy-peer-deps=true` ayarı ile yapılandırılmıştır. Bu ayar otomatik olarak uygulanır.

### 3. Firebase Yapılandırması

Firebase yapılandırmanız `src/firebaseConfig.js` dosyasında mevcut. Eğer farklı bir Firebase projesi kullanmak istiyorsanız, bu dosyayı düzenleyin:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... diğer ayarlar
};
```

### 4. Uygulamayı Çalıştırın

Geliştirme modunda çalıştırmak için:

```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

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
npm install
```

### Build Hataları

OpenSSL legacy provider hatası alırsanız, `package.json`'daki script'ler zaten `NODE_OPTIONS=--openssl-legacy-provider` ile yapılandırılmıştır.

### Firebase Bağlantı Hataları

- Firebase Console'da projenizin aktif olduğundan emin olun
- `firebaseConfig.js` dosyasındaki yapılandırmanın doğru olduğunu kontrol edin
- Firestore ve Authentication servislerinin etkin olduğunu doğrulayın

## 📝 Notlar

- Proje React 17 ve Firebase 8.x kullanmaktadır
- `react-scripts` 4.0.3 versiyonu kullanılmaktadır
- Legacy peer dependencies için `.npmrc` dosyası yapılandırılmıştır

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

**Not:** İlk kurulumdan sonra `npm start` komutu ile uygulamayı çalıştırabilirsiniz. Tüm bağımlılıklar otomatik olarak yüklenecektir.
