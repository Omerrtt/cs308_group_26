import jsPDF from 'jspdf';

// Company information
const companyInfo = {
    name: 'Malikane Electronics',
    address: 'Gültepe, Girne Sokak No1-3d',
    city: 'Küçükçekmece İstanbul',
    phone: '+90 539 397 39 49',
    email: 'info@malikanelectronics.com'
};

// Helper function to ensure Turkish characters are properly encoded
const encodeTurkishText = (text) => {
    if (!text) return '';
    // jsPDF 2.5.1 supports UTF-8, but we need to ensure proper encoding
    // Convert to string and ensure UTF-8 encoding
    return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '') || text;
};

// Helper function to properly encode Turkish characters for jsPDF
// jsPDF 2.5.1 supports UTF-8, but we need to ensure proper string handling
const safeText = (text) => {
    if (!text) return '';
    // Convert to string and ensure UTF-8 encoding
    // jsPDF handles UTF-8 strings correctly, so we just need to ensure it's a proper string
    const str = String(text);
    // Return the string as-is - jsPDF will handle UTF-8 encoding
    return str;
};

// Generate PDF Invoice using jsPDF
export const generateInvoicePDF = (invoiceData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });
    
    // Set font - helvetica supports basic Latin characters
    // For Turkish characters, we'll use the default encoding which should work
    doc.setFont('helvetica');
    
    // Colors
    const primaryColor = [0, 123, 255]; // #007bff
    const darkColor = [51, 51, 51];
    const lightColor = [108, 117, 125];
    
    let yPos = 20;
    
    // Header - Company Info
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(safeText(companyInfo.name), 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(companyInfo.address), 20, yPos);
    yPos += 5;
    doc.text(safeText(companyInfo.city), 20, yPos);
    yPos += 5;
    doc.text(safeText(`Telefon: ${companyInfo.phone}`), 20, yPos);
    yPos += 5;
    doc.text(safeText(`E-posta: ${companyInfo.email}`), 20, yPos);
    
    // Invoice Title and Info (Right side)
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA', 150, 20);
    
    yPos = 28;
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(`Fatura No: ${invoiceData.invoiceNumber || invoiceData.invoiceId || 'N/A'}`), 150, yPos);
    yPos += 5;
    doc.text(safeText(`Tarih: ${invoiceData.invoiceDateString || new Date().toLocaleDateString('tr-TR')}`), 150, yPos);
    yPos += 5;
    doc.text(safeText(`Sipariş No: ${invoiceData.orderId || 'N/A'}`), 150, yPos);
    
    // Line separator
    yPos = 50;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    // Billing Info
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Fatura Bilgileri', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const customerName = invoiceData.customer?.name || invoiceData.billingAddress?.fullName || 'Müşteri';
    doc.text(safeText(customerName), 20, yPos);
    yPos += 5;
    
    if (invoiceData.billingAddress) {
        const addr = invoiceData.billingAddress;
        if (addr.address) doc.text(safeText(addr.address), 20, yPos);
        yPos += 5;
        if (addr.city || addr.zipCode) {
            doc.text(safeText(`${addr.city || ''}${addr.zipCode ? ', ' + addr.zipCode : ''}`), 20, yPos);
            yPos += 5;
        }
        if (addr.phone) {
            doc.text(safeText(`Telefon: ${addr.phone}`), 20, yPos);
            yPos += 5;
        }
    }
    
    const customerEmail = invoiceData.customer?.email || invoiceData.billingAddress?.email || '';
    if (customerEmail) {
        doc.text(safeText(`E-posta: ${customerEmail}`), 20, yPos);
        yPos += 8;
    } else {
        yPos += 5;
    }
    
    // Items Table Header
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(...primaryColor);
    doc.rect(20, yPos - 5, 170, 8, 'F');
    
    doc.text('Ürün', 22, yPos);
    doc.text('Adet', 100, yPos);
    doc.text('Birim Fiyat', 130, yPos);
    doc.text('Toplam', 165, yPos);
    
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    
    // Items
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    
    if (invoiceData.items && invoiceData.items.length > 0) {
        invoiceData.items.forEach((item) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            const itemTitle = item.title || 'Ürün';
            const quantity = item.quantity || 1;
            const price = parseFloat(item.price) || 0;
            const total = price * quantity;
            
            // Wrap long product names - use safeText for Turkish characters
            const safeTitle = safeText(itemTitle);
            const lines = doc.splitTextToSize(safeTitle, 60);
            doc.text(lines[0], 22, yPos);
            if (lines.length > 1) {
                doc.text(safeText(lines.slice(1).join(' ')), 22, yPos + 4);
            }
            
            doc.text(quantity.toString(), 100, yPos);
            doc.text(safeText(`${price.toFixed(2)} ₺`), 130, yPos);
            doc.text(safeText(`${total.toFixed(2)} ₺`), 165, yPos);
            
            yPos += 8;
            doc.setDrawColor(220, 220, 220);
            doc.line(20, yPos, 190, yPos);
            yPos += 3;
        });
    }
    
    // Totals
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    const subtotal = invoiceData.subtotal || 0;
    const shipping = invoiceData.shipping || 0;
    const tax = invoiceData.tax || 0;
    const total = invoiceData.total || 0;
    
    doc.text('Ara Toplam:', 130, yPos);
    doc.text(safeText(`${subtotal.toFixed(2)} ₺`), 165, yPos);
    yPos += 6;
    
    if (shipping > 0) {
        doc.text('Kargo:', 130, yPos);
        doc.text(safeText(`${shipping.toFixed(2)} ₺`), 165, yPos);
        yPos += 6;
    } else {
        doc.setFont('helvetica', 'normal');
        doc.text('Kargo:', 130, yPos);
        doc.text(safeText('Ücretsiz'), 165, yPos);
        yPos += 6;
    }
    
    if (tax > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('KDV:', 130, yPos);
        doc.text(safeText(`${tax.toFixed(2)} ₺`), 165, yPos);
        yPos += 6;
    }
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('TOPLAM:', 130, yPos);
    doc.text(safeText(`${total.toFixed(2)} ₺`), 165, yPos);
    
    // Footer
    yPos = 270;
    doc.setFontSize(8);
    doc.setTextColor(...lightColor);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(`Teşekkür ederiz! ${companyInfo.name}`), 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text(safeText('Bu fatura elektronik ortamda oluşturulmuştur.'), 105, yPos, { align: 'center' });
    
    // Return PDF as blob
    return doc.output('blob');
};

// Legacy HTML generator (kept for backward compatibility)
export const generateInvoiceHTML = (orderData) => {
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



