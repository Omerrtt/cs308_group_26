const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Nodemailer import kontrolü - bazı versiyonlarda default export olabilir
let createTransport = nodemailer.createTransport;
if (!createTransport && nodemailer.default) {
  createTransport = nodemailer.default.createTransport;
}
if (!createTransport && typeof nodemailer === 'function') {
  createTransport = nodemailer;
}

console.log('Nodemailer type:', typeof nodemailer);
console.log('Nodemailer keys:', Object.keys(nodemailer));
console.log('createTransport type:', typeof createTransport);

// Firebase Admin'i başlat
admin.initializeApp();

// Hostinger SMTP transporter oluştur
const createTransporter = () => {
  // Environment variables'dan email bilgilerini al
  // Firebase Console > Functions > Configuration > Environment variables
  const email = functions.config().email?.user || process.env.EMAIL_USER;
  const password = functions.config().email?.password || process.env.EMAIL_PASSWORD;
  
  console.log('=== TRANSPORTER OLUŞTURULUYOR ===');
  console.log('Email:', email ? `${email.substring(0, 3)}***` : 'YOK');
  console.log('Password:', password ? '***' : 'YOK');
  
  if (!email || !password) {
    console.error('⚠️ Email credentials bulunamadı. Email gönderilemeyecek.');
    console.error('functions.config().email:', functions.config().email);
    console.error('process.env.EMAIL_USER:', process.env.EMAIL_USER);
    return null;
  }

  // Hostinger SMTP ayarları
  const transporterConfig = {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // SSL kullan
    auth: {
      user: email,
      pass: password
    },
    tls: {
      rejectUnauthorized: false // SSL sertifika doğrulamasını atla (gerekirse)
    },
    debug: true, // Debug modunu aç
    logger: true // Logger'ı aç
  };
  
  console.log('Transporter config:', {
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    user: email
  });
  
  // Nodemailer'ın doğru import edildiğinden emin ol
  if (typeof createTransport !== 'function') {
    console.error('❌ createTransport bir fonksiyon değil!');
    console.error('Nodemailer object:', nodemailer);
    console.error('createTransport:', createTransport);
    throw new Error('createTransport is not a function');
  }
  
  console.log('createTransport fonksiyonu bulundu, transporter oluşturuluyor...');
  const transporter = createTransport(transporterConfig);
  
  // SMTP bağlantısını test et
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP bağlantı hatası:', error);
    } else {
      console.log('✅ SMTP bağlantısı başarılı');
    }
  });
  
  return transporter;
};

// Invoice email gönderme fonksiyonu
exports.sendInvoiceEmail = functions.https.onCall(async (data, context) => {
  console.log('=== sendInvoiceEmail FONKSİYONU ÇAĞRILDI ===');
  console.log('Context auth:', context.auth ? 'Var' : 'Yok');
  console.log('Data:', JSON.stringify(data, null, 2));
  
  // Authentication kontrolü
  if (!context.auth) {
    console.error('❌ Authentication hatası: Kullanıcı giriş yapmamış');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Kullanıcı giriş yapmamış.'
    );
  }

  const { toEmail, toName, invoiceData, pdfBase64 } = data;

  console.log('toEmail:', toEmail);
  console.log('toName:', toName);
  console.log('invoiceData:', invoiceData ? 'Var' : 'Yok');
  console.log('pdfBase64:', pdfBase64 ? `Var (${pdfBase64.length} karakter)` : 'Yok');

  // Validasyon
  if (!toEmail || !invoiceData) {
    console.error('❌ Validasyon hatası: Email veya invoiceData eksik');
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email adresi ve fatura bilgileri gerekli.'
    );
  }

  try {
    // Email credentials'ı al (mailOptions için gerekli)
    const email = functions.config().email?.user || process.env.EMAIL_USER;
    const password = functions.config().email?.password || process.env.EMAIL_PASSWORD;
    
    console.log('Email credentials alındı:', email ? `${email.substring(0, 3)}***` : 'YOK');
    
    if (!email || !password) {
      console.error('❌ Email credentials bulunamadı');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email servisi yapılandırılmamış.'
      );
    }
    
    console.log('Transporter oluşturuluyor...');
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Transporter oluşturulamadı');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email servisi yapılandırılmamış.'
      );
    }
    
    console.log('✅ Transporter oluşturuldu');

    // Company bilgileri
    const companyInfo = {
      name: 'Malikane Electronics',
      address: 'Gültepe, Girne Sokak No1-3d',
      city: 'Küçükçekmece İstanbul',
      phone: '+90 539 397 39 49',
      email: 'info@malikanelectronics.com'
    };

    // Email içeriği (HTML)
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f8f9fa;
            padding: 20px;
            border: 1px solid #dee2e6;
          }
          .invoice-info {
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
          }
          .invoice-info p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fatura</h1>
        </div>
        <div class="content">
          <p>Sayın ${toName || 'Müşteri'},</p>
          <p>Siparişiniz için fatura hazırlanmıştır. Fatura detayları aşağıdadır:</p>
          
          <div class="invoice-info">
            <p><strong>Fatura No:</strong> ${invoiceData.invoiceNumber || invoiceData.invoiceId || 'N/A'}</p>
            <p><strong>Sipariş No:</strong> ${invoiceData.orderId || 'N/A'}</p>
            <p><strong>Fatura Tarihi:</strong> ${invoiceData.invoiceDateString || new Date().toLocaleDateString('tr-TR')}</p>
            <p><strong>Toplam Tutar:</strong> ${(invoiceData.total || 0).toFixed(2)} ₺</p>
          </div>
          
          <p>Fatura PDF'i bu email'e ekli olarak gönderilmiştir.</p>
          
          <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin:</p>
          <p>
            <strong>${companyInfo.name}</strong><br>
            ${companyInfo.address}<br>
            ${companyInfo.city}<br>
            E-posta: ${companyInfo.email}<br>
            Telefon: ${companyInfo.phone}
          </p>
        </div>
        <div class="footer">
          <p>Teşekkür ederiz!</p>
          <p><strong>${companyInfo.name}</strong></p>
          <p>Bu email otomatik olarak gönderilmiştir.</p>
        </div>
      </body>
      </html>
    `;

    // Email seçenekleri
    const mailOptions = {
      from: `"${companyInfo.name}" <${email}>`,
      to: toEmail,
      subject: `Fatura - ${invoiceData.invoiceNumber || invoiceData.invoiceId || 'N/A'} - ${companyInfo.name}`,
      html: emailHTML,
      attachments: pdfBase64 ? [
        {
          filename: `Fatura_${invoiceData.invoiceNumber || invoiceData.invoiceId || 'N/A'}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ] : []
    };

    // Email gönder
    console.log('Email gönderiliyor...');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Attachments:', mailOptions.attachments.length);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email gönderildi!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email başarıyla gönderildi.',
      response: info.response
    };

  } catch (error) {
    console.error('❌ Email gönderme hatası:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    console.error('Error responseCode:', error.responseCode);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    throw new functions.https.HttpsError(
      'internal',
      'Email gönderilirken bir hata oluştu: ' + error.message
    );
  }
});

// Wishlist bildirim email gönderme fonksiyonu
exports.sendWishlistNotificationEmail = functions.https.onCall(async (data, context) => {
  console.log('=== sendWishlistNotificationEmail BAŞLADI ===');
  console.log('Context auth:', context.auth ? 'Var' : 'Yok');
  console.log('Data:', JSON.stringify(data, null, 2));
  
  // Authentication kontrolü
  if (!context.auth) {
    console.error('❌ Authentication hatası: Kullanıcı giriş yapmamış');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Kullanıcı giriş yapmamış.'
    );
  }

  const { toEmail, toName, productName, productId, notificationType, oldValue, newValue } = data;

  console.log('toEmail:', toEmail);
  console.log('toName:', toName);
  console.log('productName:', productName);
  console.log('notificationType:', notificationType);

  // Validasyon
  if (!toEmail || !productName || !notificationType) {
    console.error('❌ Validasyon hatası: Gerekli alanlar eksik');
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email, ürün adı ve bildirim tipi gereklidir.'
    );
  }

  try {
    const email = functions.config().email?.user || process.env.EMAIL_USER;
    const password = functions.config().email?.password || process.env.EMAIL_PASSWORD;
    
    console.log('Email credentials alındı:', email ? `${email.substring(0, 3)}***` : 'YOK');
    
    if (!email || !password) {
      console.error('❌ Email credentials bulunamadı');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email servisi yapılandırılmamış.'
      );
    }
    
    console.log('Transporter oluşturuluyor...');
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Transporter oluşturulamadı');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email servisi yapılandırılmamış.'
      );
    }
    
    console.log('✅ Transporter oluşturuldu');

    // Company bilgileri
    const companyInfo = {
      name: 'Malikane Electronics',
      address: 'Gültepe, Girne Sokak No1-3d',
      city: 'Küçükçekmece İstanbul',
      phone: '+90 539 397 39 49',
      email: 'info@malikanelectronics.com'
    };

    // Bildirim tipine göre email içeriği
    let subject = '';
    let emailHTML = '';
    
    if (notificationType === 'stock_available') {
      subject = `${productName} - Ürün Stokta!`;
      emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #28a745;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f8f9fa;
              padding: 20px;
              border: 1px solid #dee2e6;
            }
            .product-info {
              background-color: white;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #28a745;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Ürün Stokta!</h1>
          </div>
          <div class="content">
            <p>Sayın ${toName},</p>
            <p>İstek listenizdeki <strong>${productName}</strong> ürünü tekrar stokta!</p>
            <div class="product-info">
              <p><strong>Ürün:</strong> ${productName}</p>
              <p><strong>Durum:</strong> Stokta mevcut</p>
            </div>
            <p>Hemen sipariş vermek için aşağıdaki butona tıklayın:</p>
            <a href="https://malikanelectronics.com/product-details-one/${productId}" class="button">Ürünü Görüntüle</a>
            <p>Teşekkürler,<br>${companyInfo.name}</p>
          </div>
          <div class="footer">
            <p>${companyInfo.name}</p>
            <p>${companyInfo.address}, ${companyInfo.city}</p>
            <p>Tel: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
          </div>
        </body>
        </html>
      `;
    } else if (notificationType === 'price_drop') {
      subject = `${productName} - Fiyat Düştü!`;
      emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #ffc107;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f8f9fa;
              padding: 20px;
              border: 1px solid #dee2e6;
            }
            .product-info {
              background-color: white;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #ffc107;
            }
            .price-comparison {
              display: flex;
              justify-content: space-around;
              margin: 15px 0;
            }
            .old-price {
              text-decoration: line-through;
              color: #999;
              font-size: 18px;
            }
            .new-price {
              color: #28a745;
              font-size: 24px;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Fiyat Düştü!</h1>
          </div>
          <div class="content">
            <p>Sayın ${toName},</p>
            <p>İstek listenizdeki <strong>${productName}</strong> ürününün fiyatı düştü!</p>
            <div class="product-info">
              <p><strong>Ürün:</strong> ${productName}</p>
              <div class="price-comparison">
                <div>
                  <p>Eski Fiyat:</p>
                  <p class="old-price">₺${oldValue}</p>
                </div>
                <div>
                  <p>Yeni Fiyat:</p>
                  <p class="new-price">₺${newValue}</p>
                </div>
              </div>
            </div>
            <p>Hemen sipariş vermek için aşağıdaki butona tıklayın:</p>
            <a href="https://malikanelectronics.com/product-details-one/${productId}" class="button">Ürünü Görüntüle</a>
            <p>Teşekkürler,<br>${companyInfo.name}</p>
          </div>
          <div class="footer">
            <p>${companyInfo.name}</p>
            <p>${companyInfo.address}, ${companyInfo.city}</p>
            <p>Tel: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
          </div>
        </body>
        </html>
      `;
    } else {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Geçersiz bildirim tipi.'
      );
    }

    const mailOptions = {
      from: `"${companyInfo.name}" <${email}>`,
      to: toEmail,
      subject: subject,
      html: emailHTML
    };

    console.log('Email gönderiliyor...');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email gönderildi!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Email gönderilirken bir hata oluştu: ' + error.message
    );
  }
});

// Products collection'ındaki değişiklikleri izle ve wishlist bildirimleri gönder
exports.checkWishlistNotifications = functions.firestore
  .document('products/{productId}')
  .onUpdate(async (change, context) => {
    console.log('=== checkWishlistNotifications BAŞLADI ===');
    const productId = context.params.productId;
    const before = change.before.data();
    const after = change.after.data();
    
    console.log('Product ID:', productId);
    console.log('Before stock:', before.stock);
    console.log('After stock:', after.stock);
    console.log('Before price:', before.price);
    console.log('After price:', after.price);
    
    const oldStock = typeof before.stock === 'number' ? before.stock : parseInt(before.stock || 0, 10);
    const newStock = typeof after.stock === 'number' ? after.stock : parseInt(after.stock || 0, 10);
    const oldPrice = parseFloat(before.price || 0);
    const newPrice = parseFloat(after.price || 0);
    
    // Stok değişikliği kontrolü (0'dan büyüğe geçtiyse)
    const stockBecameAvailable = oldStock === 0 && newStock > 0;
    
    // Fiyat düşüşü kontrolü (indirim)
    const priceDropped = oldPrice > 0 && newPrice > 0 && newPrice < oldPrice;
    
    console.log('Stock became available:', stockBecameAvailable);
    console.log('Price dropped:', priceDropped);
    
    if (!stockBecameAvailable && !priceDropped) {
      console.log('Bildirim gerektiren değişiklik yok, çıkılıyor...');
      return null;
    }
    
    try {
      // Tüm kullanıcıları al ve wishlist'lerini kontrol et
      const usersSnapshot = await admin.firestore().collection('users').get();
      console.log(`Toplam ${usersSnapshot.size} kullanıcı kontrol ediliyor...`);
      
      const notifications = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const wishlist = userData.wishlist || [];
        
        // Bu ürünü wishlist'inde olan kullanıcıları bul
        const wishlistItem = wishlist.find(item => 
          (item.originalId || item.id) === productId || 
          item.id === productId ||
          item.originalId === productId
        );
        
        if (wishlistItem) {
          console.log(`Kullanıcı ${userDoc.id} wishlist'inde bu ürün var`);
          
          const userEmail = userData.email;
          const userName = userData.name || 'Müşteri';
          const productName = after.title || after.name || 'Ürün';
          
          if (!userEmail) {
            console.warn(`Kullanıcı ${userDoc.id} için email bulunamadı`);
            continue;
          }
          
          // Stok bildirimi
          if (stockBecameAvailable) {
            console.log(`Stok bildirimi gönderiliyor: ${userEmail}`);
            notifications.push({
              type: 'stock_available',
              userEmail,
              userName,
              productName,
              productId,
              userId: userDoc.id
            });
          }
          
          // Fiyat düşüşü bildirimi
          if (priceDropped) {
            console.log(`Fiyat düşüşü bildirimi gönderiliyor: ${userEmail}`);
            notifications.push({
              type: 'price_drop',
              userEmail,
              userName,
              productName,
              productId,
              oldPrice,
              newPrice,
              userId: userDoc.id
            });
          }
        }
      }
      
      console.log(`Toplam ${notifications.length} bildirim gönderilecek`);
      
      // Email'leri gönder (sendWishlistNotificationEmail fonksiyonunu direkt çağır)
      const emailPromises = notifications.map(async (notification) => {
        try {
          const email = functions.config().email?.user || process.env.EMAIL_USER;
          const password = functions.config().email?.password || process.env.EMAIL_PASSWORD;
          
          if (!email || !password) {
            console.error('❌ Email credentials bulunamadı');
            return null;
          }
          
          const transporter = createTransporter();
          if (!transporter) {
            console.error('❌ Transporter oluşturulamadı');
            return null;
          }
          
          const companyInfo = {
            name: 'Malikane Electronics',
            address: 'Gültepe, Girne Sokak No1-3d',
            city: 'Küçükçekmece İstanbul',
            phone: '+90 539 397 39 49',
            email: 'info@malikanelectronics.com'
          };
          
          let subject = '';
          let emailHTML = '';
          
          if (notification.type === 'stock_available') {
            subject = `${notification.productName} - Ürün Stokta!`;
            emailHTML = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                  .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
                  .product-info { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
                  .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                </style>
              </head>
              <body>
                <div class="header"><h1>🎉 Ürün Stokta!</h1></div>
                <div class="content">
                  <p>Sayın ${notification.userName},</p>
                  <p>İstek listenizdeki <strong>${notification.productName}</strong> ürünü tekrar stokta!</p>
                  <div class="product-info">
                    <p><strong>Ürün:</strong> ${notification.productName}</p>
                    <p><strong>Durum:</strong> Stokta mevcut</p>
                  </div>
                  <p>Hemen sipariş vermek için aşağıdaki butona tıklayın:</p>
                  <a href="https://malikanelectronics.com/product-details-one/${notification.productId}" class="button">Ürünü Görüntüle</a>
                  <p>Teşekkürler,<br>${companyInfo.name}</p>
                </div>
                <div class="footer">
                  <p>${companyInfo.name}</p>
                  <p>${companyInfo.address}, ${companyInfo.city}</p>
                  <p>Tel: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
                </div>
              </body>
              </html>
            `;
          } else if (notification.type === 'price_drop') {
            subject = `${notification.productName} - Fiyat Düştü!`;
            emailHTML = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #ffc107; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                  .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
                  .product-info { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
                  .price-comparison { display: flex; justify-content: space-around; margin: 15px 0; }
                  .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
                  .new-price { color: #28a745; font-size: 24px; font-weight: bold; }
                  .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                </style>
              </head>
              <body>
                <div class="header"><h1>💰 Fiyat Düştü!</h1></div>
                <div class="content">
                  <p>Sayın ${notification.userName},</p>
                  <p>İstek listenizdeki <strong>${notification.productName}</strong> ürününün fiyatı düştü!</p>
                  <div class="product-info">
                    <p><strong>Ürün:</strong> ${notification.productName}</p>
                    <div class="price-comparison">
                      <div><p>Eski Fiyat:</p><p class="old-price">₺${notification.oldPrice}</p></div>
                      <div><p>Yeni Fiyat:</p><p class="new-price">₺${notification.newPrice}</p></div>
                    </div>
                  </div>
                  <p>Hemen sipariş vermek için aşağıdaki butona tıklayın:</p>
                  <a href="https://malikanelectronics.com/product-details-one/${notification.productId}" class="button">Ürünü Görüntüle</a>
                  <p>Teşekkürler,<br>${companyInfo.name}</p>
                </div>
                <div class="footer">
                  <p>${companyInfo.name}</p>
                  <p>${companyInfo.address}, ${companyInfo.city}</p>
                  <p>Tel: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
                </div>
              </body>
              </html>
            `;
          }
          
          const mailOptions = {
            from: `"${companyInfo.name}" <${email}>`,
            to: notification.userEmail,
            subject: subject,
            html: emailHTML
          };
          
          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Bildirim gönderildi: ${notification.userEmail} - ${notification.type}`);
          return info;
        } catch (error) {
          console.error(`❌ Bildirim gönderme hatası (${notification.userEmail}):`, error);
          return null;
        }
      });
      
      await Promise.all(emailPromises);
      console.log('✅ Tüm bildirimler gönderildi');
      
      return null;
    } catch (error) {
      console.error('❌ Wishlist bildirim kontrolü hatası:', error);
      return null;
    }
  });

// Refund onay email gönderme fonksiyonu
exports.sendRefundApprovalEmail = functions.https.onCall(async (data, context) => {
  console.log('=== sendRefundApprovalEmail FONKSİYONU ÇAĞRILDI ===');
  console.log('Context auth:', context.auth ? 'Var' : 'Yok');
  console.log('Data:', JSON.stringify(data, null, 2));
  
  // Authentication kontrolü
  if (!context.auth) {
    console.error('❌ Authentication hatası: Kullanıcı giriş yapmamış');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Kullanıcı giriş yapmamış.'
    );
  }

  const { userEmail, userName, orderId, refundAmount, refundNote } = data;

  if (!userEmail || !userName || !orderId || refundAmount === undefined || refundAmount === null) {
    console.error('❌ Eksik parametreler:', { userEmail, userName, orderId, refundAmount });
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Eksik parametreler: userEmail, userName, orderId, refundAmount gerekli.'
    );
  }

  // Email credentials kontrolü
  const email = functions.config().email?.user || process.env.EMAIL_USER;
  const password = functions.config().email?.password || process.env.EMAIL_PASSWORD;
  
  console.log('Email credentials kontrolü:', email ? `${email.substring(0, 3)}***` : 'YOK');
  
  if (!email || !password) {
    console.error('❌ Email credentials bulunamadı');
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email servisi yapılandırılmamış. Lütfen Firebase Console\'dan email credentials ayarlayın.'
    );
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.error('❌ Transporter oluşturulamadı');
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email servisi yapılandırılamadı.'
    );
  }

  const companyInfo = {
    name: 'Malikan Electronics',
    address: 'İstanbul, Türkiye',
    city: 'İstanbul',
    phone: '+90 539 397 39 49',
    email: email || 'info@malikanelectronics.com'
  };

  try {
    const subject = `İade Onayı - Sipariş #${orderId}`;
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
          .refund-info { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
        </style>
      </head>
      <body>
        <div class="header"><h1>✅ İade Onaylandı</h1></div>
        <div class="content">
          <p>Sayın ${userName},</p>
          <p>Sipariş #${orderId} için iade talebiniz onaylanmıştır.</p>
          <div class="refund-info">
            <p><strong>Sipariş ID:</strong> #${orderId}</p>
            <div class="amount">İade Tutarı: ₺${parseFloat(refundAmount).toFixed(2)}</div>
            ${refundNote ? `<p><strong>Not:</strong> ${refundNote}</p>` : ''}
          </div>
          <p>İade tutarı, ödeme yaptığınız kredi kartına veya hesabınıza en geç 3-5 iş günü içinde yansıtılacaktır.</p>
          <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
          <p>Teşekkürler,<br>${companyInfo.name}</p>
        </div>
        <div class="footer">
          <p>${companyInfo.name}</p>
          <p>${companyInfo.address}, ${companyInfo.city}</p>
          <p>Tel: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${companyInfo.name}" <${email}>`,
      to: userEmail,
      subject: subject,
      html: emailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Refund onay emaili gönderildi: ${userEmail} - Sipariş #${orderId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Refund onay emaili gönderme hatası:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Email gönderilemedi: ' + error.message
    );
  }
});

