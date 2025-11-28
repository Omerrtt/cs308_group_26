// Invoice PDF Generator
// Note: This is a simplified version. For production, use a proper PDF library like jsPDF or pdfkit

export const generateInvoicePDF = (orderData) => {
    // Company information
    const companyInfo = {
        name: 'Malikane Electronics',
        address: 'Gültepe, Girne Sokak No1-3d',
        city: 'Küçükçekmece İstanbul',
        phone: '+90 539 397 39 49',
        email: 'info@malikanelectronics.com'
    }

    // Create invoice HTML
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Fatura - ${orderData.invoiceNumber || 'INVOICE'}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }
                .header {
                    border-bottom: 3px solid #007bff;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-info {
                    float: left;
                    width: 50%;
                }
                .invoice-info {
                    float: right;
                    width: 50%;
                    text-align: right;
                }
                .clear {
                    clear: both;
                }
                .invoice-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 10px;
                }
                .invoice-number {
                    font-size: 14px;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <div class="invoice-title">${companyInfo.name}</div>
                    <p>${companyInfo.address}<br>
                    ${companyInfo.city}<br>
                    Telefon: ${companyInfo.phone}<br>
                    E-posta: ${companyInfo.email}</p>
                </div>
                <div class="invoice-info">
                    <div class="invoice-title">FATURA</div>
                    <p class="invoice-number">Fatura No: ${orderData.invoiceNumber || 'N/A'}<br>
                    Tarih: ${new Date().toLocaleDateString('tr-TR')}<br>
                    Sipariş No: ${orderData.orderId || 'N/A'}</p>
                </div>
                <div class="clear"></div>
            </div>

            <div class="billing-info">
                <h3>Fatura Bilgileri</h3>
                <p>
                    <strong>${orderData.userName || 'Müşteri'}</strong><br>
                    ${orderData.address?.fullAddress || ''}<br>
                    ${orderData.address?.city || ''}, ${orderData.address?.zipCode || ''}<br>
                    ${orderData.address?.country || ''}<br>
                    E-posta: ${orderData.userEmail || ''}
                </p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Ürün</th>
                        <th>Adet</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items?.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toFixed(2)} ₺</td>
                            <td>${(item.price * item.quantity).toFixed(2)} ₺</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="total-row">Ara Toplam</td>
                        <td class="total-row">${orderData.subtotal?.toFixed(2) || '0.00'} ₺</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total-row">Kargo</td>
                        <td class="total-row">Ücretsiz</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total-row">TOPLAM</td>
                        <td class="total-row">${orderData.total?.toFixed(2) || '0.00'} ₺</td>
                    </tr>
                </tfoot>
            </table>

            <div class="footer">
                <p>Teşekkür ederiz! ${companyInfo.name}</p>
                <p>Bu fatura elektronik ortamda oluşturulmuştur.</p>
            </div>
        </body>
        </html>
    `

    return invoiceHTML
}

// Send invoice via email (simplified - in production, use Firebase Cloud Functions or a backend service)
export const sendInvoiceEmail = async (userEmail, invoiceHTML, invoiceNumber) => {
    // Note: This is a placeholder. In production, you should:
    // 1. Use Firebase Cloud Functions with nodemailer
    // 2. Or use a service like SendGrid, Mailgun, etc.
    // 3. Or use Firebase Extensions for email sending
    
    console.log('Invoice email would be sent to:', userEmail)
    console.log('Invoice Number:', invoiceNumber)
    
    // For now, we'll just log it. In production, implement actual email sending
    // Example with Firebase Cloud Functions:
    /*
    const functions = firebase.functions()
    const sendInvoice = functions.httpsCallable('sendInvoiceEmail')
    await sendInvoice({
        to: userEmail,
        subject: `Fatura - ${invoiceNumber}`,
        html: invoiceHTML
    })
    */
    
    return true
}

