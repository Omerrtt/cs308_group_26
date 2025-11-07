# CS308 - Authentication System

Bu proje, login ve register sayfalarını içeren basit bir authentication sistemidir.

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. `.env` dosyası oluşturun ve preflight check'i atlayın:

```bash
echo "SKIP_PREFLIGHT_CHECK=true" > .env
```

**Not:** Firebase yapılandırması `src/firebaseConfig.js` dosyasında zaten mevcut olduğu için ekstra bir yapılandırma gerekmez.

## Çalıştırma

```bash
npm start
```

Proje `http://localhost:3000` adresinde çalışacaktır.

## Sayfalar

- `/login` - Giriş sayfası
- `/register` - Kayıt sayfası

## Teknolojiler

- React 17
- React Router DOM
- Bootstrap 5
- Font Awesome

