# Hostinger Email ile Invoice Gönderme Kurulum Rehberi

Bu rehber, Hostinger mail adresinizden invoice (fatura) PDF'lerini kullanıcılara email olarak göndermek için gerekli adımları içerir.

## Gereksinimler

- Firebase CLI yüklü olmalı (`npm install -g firebase-tools`)
- Firebase projesi oluşturulmuş olmalı
- Hostinger mail adresi: `info@malikanelectronics.com`
- Hostinger mail şifresi: `49Dogum2003?`

## Adımlar

### 1. Firebase CLI ile Giriş Yapma

```bash
firebase login
```

### 2. Firebase Projesini Bağlama

```bash
firebase use malikane-18a27
```

### 3. Functions Dependencies Yükleme

```bash
cd functions
npm install
cd ..
```

### 4. Email Credentials Yapılandırma

Firebase Functions için email bilgilerini environment variables olarak ayarlayın:

#### Seçenek 1: Firebase CLI ile (Önerilen)

```bash
firebase functions:config:set email.user="info@malikanelectronics.com" email.password="49Dogum2003?"
```

#### Seçenek 2: Firebase Console'dan

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: **malikane-18a27**
3. **Functions** sekmesine gidin
4. **Configuration** sekmesine tıklayın
5. **Environment variables** bölümüne gidin
6. Şu değişkenleri ekleyin:
   - `email.user`: `info@malikanelectronics.com`
   - `email.password`: `49Dogum2003?`

### 5. Functions'ı Deploy Etme

```bash
firebase deploy --only functions
```

Sadece `sendInvoiceEmail` fonksiyonunu deploy etmek için:
```bash
firebase deploy --only functions:sendInvoiceEmail
```

### 6. Test Etme

Deploy işlemi tamamlandıktan sonra, checkout sayfasından bir sipariş tamamlayın. Email otomatik olarak gönderilecektir.

## Hostinger SMTP Ayarları

Functions kodunda Hostinger SMTP ayarları şu şekilde yapılandırılmıştır:

- **Host**: `smtp.hostinger.com`
- **Port**: `465` (SSL)
- **Secure**: `true` (SSL kullan)
- **Auth**: Email ve şifre ile

## Email Gönderen Adres

Email'ler şu adresten gönderilir:
- `info@malikanelectronics.com` (Hostinger mail adresiniz)

## Sorun Giderme

### Email gönderilmiyor

1. **Functions loglarını kontrol edin:**
   ```bash
   firebase functions:log
   ```

2. **Environment variables'ları kontrol edin:**
   ```bash
   firebase functions:config:get
   ```

3. **Hostinger mail şifresinin doğru olduğundan emin olun**

4. **Hostinger SMTP ayarlarını kontrol edin:**
   - Hostinger panelinden SMTP ayarlarını kontrol edin
   - Port 465 (SSL) veya 587 (TLS) kullanılabilir

### "Email servisi yapılandırılmamış" hatası

- Environment variables'ların doğru ayarlandığından emin olun
- Functions'ı yeniden deploy edin

### "Permission denied" hatası

- Firebase Functions için billing account'un aktif olduğundan emin olun
- Blaze plan (pay-as-you-go) gerekli olabilir

### SMTP bağlantı hatası

- Hostinger SMTP sunucusunun erişilebilir olduğundan emin olun
- Firewall veya güvenlik ayarlarını kontrol edin
- Port 465 veya 587'nin açık olduğundan emin olun

## Alternatif Port Ayarları

Eğer port 465 çalışmazsa, port 587 (TLS) kullanabilirsiniz. `functions/index.js` dosyasında:

```javascript
return nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // TLS kullan
  auth: {
    user: email,
    pass: password
  }
});
```

## Güvenlik Notları

- **Şifreyi asla kod içine yazmayın**
- Environment variables kullanın
- `.env` dosyalarını `.gitignore`'a ekleyin
- Production'da Firebase Console'dan environment variables'ları yönetin

## Maliyet

Firebase Cloud Functions ücretsiz tier'da:
- 2 milyon invocation/ay
- 400,000 GB-saniye compute time/ay
- 5 GB egress/ay

Email gönderme işlemi çok hızlı olduğu için maliyet genellikle çok düşüktür.

## İleri Seviye

### Email Template'i Özelleştirme

`functions/index.js` dosyasındaki `emailHTML` değişkenini düzenleyerek email template'ini özelleştirebilirsiniz.

### Email Queue Sistemi

Yüksek trafikli uygulamalar için email'leri queue'ya alıp asenkron olarak gönderebilirsiniz.

