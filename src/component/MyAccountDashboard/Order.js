import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { auth, db } from '../../firebaseConfig'
import { generateInvoicePDF } from '../../utils/invoiceGenerator'
import Swal from 'sweetalert2'
import ReviewModal from './ReviewModal'

const Order = () => {
    const status = useSelector((state) => state.user.status)
    const [orders, setOrders] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)

    // Body scroll'u kontrol et ve düzelt
    useEffect(() => {
        // Component mount olduğunda body scroll'u aktif et
        document.body.style.overflow = 'auto'
        
        return () => {
            // Component unmount olduğunda da scroll'u aktif et
            document.body.style.overflow = 'auto'
        }
    }, [])

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            
            const currentUser = auth.currentUser
            if (!currentUser) {
                setOrders([])
                setInvoices([])
                setLoading(false)
                return
            }
            
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
            } else {
                setOrders([])
                setInvoices([])
            }
        } catch (error) {
            console.error('❌ Order yükleme hatası:', error)
            setError('Siparişler yüklenirken bir hata oluştu.')
            setOrders([])
            setInvoices([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status) {
            loadOrders()
        } else {
            setLoading(false)
            setOrders([])
            setInvoices([])
        }
    }, [status, loadOrders])

    // Format date - memoized
    const formatDate = useCallback((dateString) => {
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
    }, [])

    // Format price - memoized
    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0)
    }, [])

    // Status map - memoized
    const statusMap = useMemo(() => ({
        text: {
            'processing': 'İşleniyor',
            'in-transit': 'Yolda',
            'delivered': 'Teslim Edildi'
        },
        class: {
            'processing': 'badge-warning',
            'in-transit': 'badge-info',
            'delivered': 'badge-success'
        }
    }), [])

    // Get status text
    const getStatusText = useCallback((status) => {
        return statusMap.text[status] || status || 'Bilinmiyor'
    }, [statusMap])

    // Get status badge class
    const getStatusClass = useCallback((status) => {
        return statusMap.class[status] || 'badge-secondary'
    }, [statusMap])

    // Get status badge (React component)
    const getStatusBadge = useCallback((status) => {
        const statusText = getStatusText(status)
        const statusClass = getStatusClass(status)
        return <span className={`badge ${statusClass}`}>{statusText}</span>
    }, [getStatusText, getStatusClass])

    // Invoice indir - memoized
    const downloadInvoice = useCallback((orderId) => {
        try {
            // İlgili invoice'u bul
            const invoice = invoices.find(inv => inv.orderId === orderId)
            
            if (!invoice) {
                Swal.fire({
                    title: 'Fatura Bulunamadı',
                    text: 'Bu sipariş için fatura bulunamadı.',
                    icon: 'warning'
                }).then(() => {
                    // Modal kapandıktan sonra body scroll'u aktif et
                    document.body.style.overflow = 'auto'
                })
                return
            }
            
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
            
            Swal.fire({
                title: 'Başarılı',
                text: 'Fatura indirildi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Modal kapandıktan sonra body scroll'u aktif et
                document.body.style.overflow = 'auto'
            })
        } catch (error) {
            console.error('❌ Invoice indirme hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Fatura indirilirken bir hata oluştu.',
                icon: 'error'
            }).then(() => {
                // Modal kapandıktan sonra body scroll'u aktif et
                document.body.style.overflow = 'auto'
            })
        }
    }, [invoices])

    // Review modal'ı aç - memoized
    const openReviewModal = useCallback((order) => {
        setSelectedOrderForReview(order)
        document.body.style.overflow = 'hidden'
    }, [])

    // Review modal'ı kapat
    const closeReviewModal = useCallback(() => {
        setSelectedOrderForReview(null)
        document.body.style.overflow = 'auto'
    }, [])

    // Review başarılı olduğunda
    const handleReviewSuccess = useCallback(() => {
        closeReviewModal()
        loadOrders() // Order'ları yeniden yükle
    }, [closeReviewModal, loadOrders])

    // Order detaylarını göster - memoized
    const showOrderDetails = useCallback((order) => {
        const invoice = invoices.find(inv => inv.orderId === order.orderId)
        const orderStatus = order.status || 'processing'
        
        Swal.fire({
            title: 'Sipariş Detayları',
            html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                    <p><strong>Sipariş ID:</strong> ${order.orderId || 'N/A'}</p>
                    <p><strong>Fatura No:</strong> ${invoice?.invoiceNumber || invoice?.invoiceId || 'N/A'}</p>
                    <p><strong>Tarih:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
                    <p><strong>Durum:</strong> <span class="badge ${getStatusClass(orderStatus)}">${getStatusText(orderStatus)}</span></p>
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
            confirmButtonColor: '#007bff',
            didClose: () => {
                // Modal kapandıktan sonra body scroll'u aktif et
                document.body.style.overflow = 'auto'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                downloadInvoice(order.orderId)
            } else {
                // Modal kapandıktan sonra body scroll'u aktif et
                document.body.style.overflow = 'auto'
            }
        })
    }, [invoices, formatDate, formatPrice, getStatusText, getStatusClass, downloadInvoice])

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

    if (error) {
        return (
            <div className="myaccount-content">
                <h4 className="title">Siparişlerim</h4>
                <p style={{ color: 'red' }}>{error}</p>
                <button 
                    className="btn btn-primary" 
                    onClick={loadOrders}
                    style={{ marginTop: '10px' }}
                >
                    Tekrar Dene
                </button>
            </div>
        )
    }

    return (
        <>
            {selectedOrderForReview && (
                <ReviewModal
                    order={selectedOrderForReview}
                    onClose={closeReviewModal}
                    onSuccess={handleReviewSuccess}
                />
            )}
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
                                    
                                    // Debug: Status kontrolü
                                    const isDelivered = orderStatus === 'delivered' || orderStatus === 'Teslim Edildi'
                                    
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
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    Fatura İndir
                                                </button>
                                                {isDelivered && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => openReviewModal(order)}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        ⭐ Değerlendir
                                                    </button>
                                                )}
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
