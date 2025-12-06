import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { auth, db } from '../../firebaseConfig'
import { generateInvoicePDF } from '../../utils/invoiceGenerator'
import Swal from 'sweetalert2'

const Order = () => {
    const status = useSelector((state) => state.user.status)
    const [orders, setOrders] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status) {
            loadOrders()
        } else {
            setLoading(false)
        }
    }, [status])

    const loadOrders = async () => {
        try {
            const currentUser = auth.currentUser
            if (!currentUser) {
                setLoading(false)
                return
            }

            console.log('📦 Kullanıcı order\'ları yükleniyor...')
            
            // Users collection'ından order'ları çek
            const userDoc = await db.collection('users').doc(currentUser.uid).get()
            
            if (userDoc.exists) {
                const userData = userDoc.data()
                const userOrders = userData.orders || []
                const userInvoices = userData.invoices || []
                
                // Order'ları tarihe göre sırala (en yeni önce)
                const sortedOrders = [...userOrders].sort((a, b) => {
                    const dateA = a.orderDateTimestamp || a.createdAtTimestamp || 0
                    const dateB = b.orderDateTimestamp || b.createdAtTimestamp || 0
                    return dateB - dateA
                })
                
                setOrders(sortedOrders)
                setInvoices(userInvoices)
                console.log(`✅ ${sortedOrders.length} sipariş yüklendi`)
            } else {
                setOrders([])
                setInvoices([])
            }
        } catch (error) {
            console.error('❌ Order yükleme hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Siparişler yüklenirken bir hata oluştu.',
                icon: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Tarih yok'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return dateString
        }
    }

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0)
    }

    // Get status text
    const getStatusText = (status) => {
        const statusMap = {
            'processing': 'İşleniyor',
            'in-transit': 'Yolda',
            'delivered': 'Teslim Edildi'
        }
        return statusMap[status] || status || 'Bilinmiyor'
    }

    // Get status badge class
    const getStatusClass = (status) => {
        const statusMap = {
            'processing': 'badge-warning',
            'in-transit': 'badge-info',
            'delivered': 'badge-success'
        }
        return statusMap[status] || 'badge-secondary'
    }

    // Get status badge (React component)
    const getStatusBadge = (status) => {
        const statusText = getStatusText(status)
        const statusClass = getStatusClass(status)
        return <span className={`badge ${statusClass}`}>{statusText}</span>
    }

    // Invoice indir
    const downloadInvoice = (orderId) => {
        try {
            // İlgili invoice'u bul
            const invoice = invoices.find(inv => inv.orderId === orderId)
            
            if (!invoice) {
                Swal.fire({
                    title: 'Fatura Bulunamadı',
                    text: 'Bu sipariş için fatura bulunamadı.',
                    icon: 'warning'
                })
                return
            }

            console.log('📄 Invoice PDF oluşturuluyor...', invoice)
            
            // PDF oluştur
            const invoicePDFBlob = generateInvoicePDF(invoice)
            
            // PDF'i indir
            const pdfUrl = URL.createObjectURL(invoicePDFBlob)
            const link = document.createElement('a')
            link.href = pdfUrl
            link.download = `Fatura_${invoice.invoiceNumber || invoice.invoiceId || orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl)
            }, 100)
            
            console.log('✅ Invoice indirildi')
            
            Swal.fire({
                title: 'Başarılı',
                text: 'Fatura indirildi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            console.error('❌ Invoice indirme hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Fatura indirilirken bir hata oluştu.',
                icon: 'error'
            })
        }
    }

    // Order detaylarını göster
    const showOrderDetails = (order) => {
        const invoice = invoices.find(inv => inv.orderId === order.orderId)
        
        Swal.fire({
            title: 'Sipariş Detayları',
            html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                    <p><strong>Sipariş ID:</strong> ${order.orderId || 'N/A'}</p>
                    <p><strong>Fatura No:</strong> ${invoice?.invoiceNumber || invoice?.invoiceId || 'N/A'}</p>
                    <p><strong>Tarih:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
                    <p><strong>Durum:</strong> <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
                    <p><strong>Ara Toplam:</strong> ${formatPrice(order.subtotal)}</p>
                    <p><strong>Kargo:</strong> ${formatPrice(order.shipping || 0)}</p>
                    <p><strong>Vergi:</strong> ${formatPrice(order.tax || 0)}</p>
                    <p><strong>Toplam:</strong> ${formatPrice(order.total)}</p>
                    <p><strong>Ödeme Durumu:</strong> ${order.paymentStatus || 'N/A'}</p>
                    <p><strong>Ödeme Yöntemi:</strong> ${order.paymentMethod || 'N/A'}</p>
                    ${order.deliveryAddress ? `
                        <p><strong>Teslimat Adresi:</strong></p>
                        <p style="margin-left: 20px;">
                            ${order.deliveryAddress.fullName || order.deliveryAddress.name || ''}<br/>
                            ${order.deliveryAddress.address || ''}<br/>
                            ${order.deliveryAddress.city || ''} ${order.deliveryAddress.zipCode || ''}<br/>
                            ${order.deliveryAddress.phone || ''}
                        </p>
                    ` : ''}
                    ${order.items && order.items.length > 0 ? `
                        <p><strong>Ürünler:</strong></p>
                        <ul style="margin-left: 20px;">
                            ${order.items.map(item => `<li>${item.title} x${item.quantity} - ${formatPrice(item.price * item.quantity)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Faturayı İndir',
            cancelButtonText: 'Kapat',
            confirmButtonColor: '#007bff'
        }).then((result) => {
            if (result.isConfirmed) {
                downloadInvoice(order.orderId)
            }
        })
    }

    if (loading) {
        return (
            <div className="myaccount-content">
                <h4 className="title">Siparişlerim</h4>
                <p>Yükleniyor...</p>
            </div>
        )
    }

    if (!status) {
        return (
            <div className="myaccount-content">
                <h4 className="title">Siparişlerim</h4>
                <p>Lütfen giriş yapın.</p>
            </div>
        )
    }

    return (
        <>
            <div className="myaccount-content">
                <h4 className="title">Siparişlerim</h4>
                {orders.length === 0 ? (
                    <p>Henüz siparişiniz bulunmuyor.</p>
                ) : (
                    <div className="table_page table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th>Toplam</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => {
                                    const itemCount = order.items ? order.items.length : 0
                                    const orderStatus = order.status || 'processing' // Default status
                                    return (
                                        <tr key={order.orderId || index}>
                                            <td>{order.orderId || 'N/A'}</td>
                                            <td>{formatDate(order.orderDate || order.createdAt)}</td>
                                            <td>{getStatusBadge(orderStatus)}</td>
                                            <td>{formatPrice(order.total)} ({itemCount} ürün)</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => showOrderDetails(order)}
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    Detay
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => downloadInvoice(order.orderId)}
                                                >
                                                    Fatura İndir
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default Order
