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

