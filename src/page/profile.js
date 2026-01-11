import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Header from '../component/Common/Header'
import Footer from '../component/Common/Footer'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { auth, db } from '../firebaseConfig'
import firebase from 'firebase/app'
import { generateInvoicePDF } from '../utils/invoiceGenerator'
import Swal from 'sweetalert2'
import ReviewModal from '../component/MyAccountDashboard/ReviewModal'

/**
 * Admin kullanıcı UID'si
 * Bu UID'ye sahip kullanıcılar admin yetkilerine sahiptir
 */
const ADMIN_UID = 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';

const Profile = () => {
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);
    const [orders, setOrders] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)

    /**
     * Body scroll davranışını kontrol eder
     * Modal açıldığında scroll'u engellemek için kullanılır
     */
    useEffect(() => {
        document.body.style.overflow = 'auto'
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [])

    const loadOrders = useCallback(async (currentUser) => {
        try {
            setLoading(true)
            setError(null)
            
            if (!currentUser) {
                setOrders([])
                setInvoices([])
                setLoading(false)
                return
            }
            
            // Firebase'den kullanıcının sipariş ve fatura bilgilerini çek
            const userDoc = await db.collection('users').doc(currentUser.uid).get()
            
            if (userDoc.exists) {
                const userData = userDoc.data()
                const userOrders = userData.orders || []
                const userInvoices = userData.invoices || []
                
                // Siparişleri tarihe göre sırala (en yeni siparişler önce)
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

    /**
     * Firebase authentication state'ini dinler ve siparişleri yükler
     * Kullanıcı giriş yapmamışsa login sayfasına yönlendirir
     */
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                // Kullanıcı giriş yapmamış - login sayfasına yönlendir
                history.push('/login')
                setLoading(false)
                return
            }

            // Admin yetkisi kontrolü
            setIsAdmin(currentUser.uid === ADMIN_UID)

            // Kullanıcı giriş yapmış - siparişleri yükle
            await loadOrders(currentUser)
        })

        // Component unmount olduğunda listener'ı temizle
        return () => unsubscribe()
    }, [history, loadOrders])

    /**
     * Tarih string'ini Türkçe formatında formatlar
     * @param {string} dateString - ISO formatında tarih string'i
     * @returns {string} Formatlanmış tarih string'i
     */
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

    /**
     * Fiyatı Türk Lirası formatında formatlar
     * @param {number} price - Formatlanacak fiyat
     * @returns {string} Formatlanmış fiyat string'i (örn: "1.234,56 ₺")
     */
    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0)
    }, [])

    /**
     * Sipariş durumları için mapping objesi
     * Her durumun görüntü metni ve CSS class'ı tanımlanır
     */
    const statusMap = useMemo(() => ({
        text: {
            'processing': 'İşleniyor',
            'in-transit': 'Yolda',
            'delivered': 'Teslim Edildi',
            'cancelled': 'İptal Edildi',
            'returned': 'İade Edildi',
            'refunded': 'İade Edildi'
        },
        class: {
            'processing': 'badge-warning',
            'in-transit': 'badge-info',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger',
            'returned': 'badge-danger',
            'refunded': 'badge-danger'
        }
    }), [])

    const getStatusText = useCallback((status) => {
        return statusMap.text[status] || status || 'Bilinmiyor'
    }, [statusMap])

    const getStatusClass = useCallback((status) => {
        return statusMap.class[status] || 'badge-secondary'
    }, [statusMap])

    const getStatusBadge = useCallback((status) => {
        const statusText = getStatusText(status)
        const statusClass = getStatusClass(status)
        return <span className={`badge ${statusClass}`} style={{ color: '#000' }}>{statusText}</span>
    }, [getStatusText, getStatusClass])

    /**
     * Sipariş faturasını PDF olarak indirir
     * @param {string} orderId - İndirilecek faturanın sipariş ID'si
     */
    const downloadInvoice = useCallback((orderId) => {
        try {
            const invoice = invoices.find(inv => inv.orderId === orderId)
            
            if (!invoice) {
                Swal.fire({
                    title: 'Fatura Bulunamadı',
                    text: 'Bu sipariş için fatura bulunamadı.',
                    icon: 'warning'
                }).then(() => {
                    document.body.style.overflow = 'auto'
                })
                return
            }
            
            const invoicePDFBlob = generateInvoicePDF(invoice)
            const pdfUrl = URL.createObjectURL(invoicePDFBlob)
            const link = document.createElement('a')
            link.href = pdfUrl
            link.download = `Fatura_${invoice.invoiceNumber || invoice.invoiceId || orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
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
                document.body.style.overflow = 'auto'
            })
        } catch (error) {
            console.error('❌ Invoice indirme hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Fatura indirilirken bir hata oluştu.',
                icon: 'error'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
        }
    }, [invoices])

    /**
     * Sipariş detaylarını modal'da gösterir
     * @param {Object} order - Detayları gösterilecek sipariş objesi
     */
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
                document.body.style.overflow = 'auto'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                downloadInvoice(order.orderId)
            } else {
                document.body.style.overflow = 'auto'
            }
        })
    }, [invoices, formatDate, formatPrice, getStatusText, getStatusClass, downloadInvoice])

    /**
     * Ürün değerlendirme modal'ını açar
     * @param {Object} order - Değerlendirilecek sipariş objesi
     */
    const openReviewModal = useCallback((order) => {
        setSelectedOrderForReview(order)
        document.body.style.overflow = 'hidden'
    }, [])

    /**
     * Ürün değerlendirme modal'ını kapatır
     */
    const closeReviewModal = useCallback(() => {
        setSelectedOrderForReview(null)
        document.body.style.overflow = 'auto'
    }, [])

    /**
     * Ürün değerlendirmesi başarıyla tamamlandığında çağrılır
     * Modal'ı kapatır ve sipariş listesini yeniler
     */
    const handleReviewSuccess = useCallback(() => {
        closeReviewModal()
        // Sipariş listesini yeniden yükle
        const currentUser = auth.currentUser
        if (currentUser) {
            loadOrders(currentUser)
        }
    }, [closeReviewModal, loadOrders])

    /**
     * Siparişi iptal eder
     * Sadece "processing" (İşleniyor) durumundaki siparişler iptal edilebilir
     * İptal edilen siparişin ürün stokları otomatik olarak geri eklenir
     * @param {Object} order - İptal edilecek sipariş objesi
     */
    const cancelOrder = useCallback(async (order) => {
        const orderStatus = order.status || 'processing'
        
        if (orderStatus !== 'processing') {
            Swal.fire({
                title: 'İptal Edilemez',
                text: 'Sadece "İşleniyor" durumundaki siparişler iptal edilebilir.',
                icon: 'warning',
                confirmButtonText: 'Tamam'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Siparişi İptal Et',
            text: `Sipariş #${order.orderId} iptal edilecek. Emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, İptal Et',
            cancelButtonText: 'Vazgeç'
        })

        if (!result.isConfirmed) {
            document.body.style.overflow = 'auto'
            return
        }

        try {
            const currentUser = auth.currentUser
            if (!currentUser) {
                throw new Error('Kullanıcı giriş yapmamış')
            }

            const userRef = db.collection('users').doc(currentUser.uid)
            const userDoc = await userRef.get()
            
            if (!userDoc.exists) {
                throw new Error('Kullanıcı bulunamadı')
            }

            const userData = userDoc.data()
            const orders = userData.orders || []
            
            // Order'ı bul ve güncelle
            const updatedOrders = orders.map((o) => {
                if (o.orderId === order.orderId) {
                    return {
                        ...o,
                        status: 'cancelled',
                        cancelledAt: new Date().toISOString(),
                        cancelledAtTimestamp: Date.now(),
                        updatedAt: new Date().toISOString(),
                        updatedAtTimestamp: Date.now()
                    }
                }
                return o
            })

            await userRef.update({ orders: updatedOrders })

            // Orders collection'ındaki siparişi de güncelle (senkronizasyon için)
            try {
                const orderRef = db.collection('orders').doc(order.orderId)
                await orderRef.update({
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            } catch (err) {
                console.warn('Orders collection güncellenemedi:', err)
            }

            // İptal edilen siparişin ürün stoklarını geri ekle (stok yönetimi)
            try {
                console.log('İptal edilen sipariş için stoklar geri artırılıyor...')
                const batch = db.batch()
                let stockUpdateCount = 0
                
                if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                        // Ürün ID'sini belirle (öncelik sırası: originalId > productId > id)
                        const productId = item.originalId || item.productId || item.id
                        if (!productId) {
                            console.warn('  ⚠️ Ürün ID bulunamadı:', item)
                            continue
                        }
                        
                        const productRef = db.collection('products').doc(productId.toString())
                        const productDoc = await productRef.get()
                        
                        if (productDoc.exists) {
                            const productData = productDoc.data()
                            const currentStock = typeof productData.stock === 'number' 
                                ? productData.stock 
                                : parseInt(productData.stock, 10) || 0
                            
                            const quantityToRestore = item.quantity || 1
                            const newStock = currentStock + quantityToRestore
                            
                            batch.update(productRef, {
                                stock: newStock,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                            
                            stockUpdateCount++
                            console.log(`  - Ürün ${productId}: ${currentStock} → ${newStock} (${quantityToRestore} adet eklendi)`)
                        } else {
                            console.warn(`  ⚠️ Ürün bulunamadı: ${productId}`)
                        }
                    }
                    
                    if (stockUpdateCount > 0) {
                        await batch.commit()
                        console.log(`✅ ${stockUpdateCount} ürünün stoku geri artırıldı`)
                    }
                }
            } catch (stockError) {
                console.error('❌ Stok geri artırma hatası:', stockError)
                // Not: Stok güncelleme hatası sipariş iptalini engellemez, sadece loglanır
            }

            Swal.fire({
                title: 'Başarılı',
                text: 'Sipariş iptal edildi ve stoklar geri artırıldı.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                document.body.style.overflow = 'auto'
            })

            // Order'ları yeniden yükle
            const currentUserAfter = auth.currentUser
            if (currentUserAfter) {
                loadOrders(currentUserAfter)
            }
        } catch (error) {
            console.error('❌ Sipariş iptal hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Sipariş iptal edilirken bir hata oluştu.',
                icon: 'error'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
        }
    }, [loadOrders])

    /**
     * Siparişi iade eder ve ödeme iadesi talebi oluşturur
     * Sadece "delivered" (Teslim Edildi) durumundaki siparişler iade edilebilir
     * İade edilen siparişin ürün stokları otomatik olarak geri eklenir
     * @param {Object} order - İade edilecek sipariş objesi
     */
    const returnOrder = useCallback(async (order) => {
        const orderStatus = order.status || 'processing'
        
        if (orderStatus !== 'delivered') {
            Swal.fire({
                title: 'İade Edilemez',
                text: 'Sadece "Teslim Edildi" durumundaki siparişler iade edilebilir.',
                icon: 'warning',
                confirmButtonText: 'Tamam'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Siparişi İade Et',
            text: `Sipariş #${order.orderId} iade edilecek ve ödeme iadesi yapılacak. Emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, İade Et',
            cancelButtonText: 'Vazgeç'
        })

        if (!result.isConfirmed) {
            document.body.style.overflow = 'auto'
            return
        }

        try {
            const currentUser = auth.currentUser
            if (!currentUser) {
                throw new Error('Kullanıcı giriş yapmamış')
            }

            const userRef = db.collection('users').doc(currentUser.uid)
            const userDoc = await userRef.get()
            
            if (!userDoc.exists) {
                throw new Error('Kullanıcı bulunamadı')
            }

            const userData = userDoc.data()
            const orders = userData.orders || []
            
            // Siparişi bul ve durumunu "returned" olarak güncelle, iade bilgilerini ekle
            const updatedOrders = orders.map((o) => {
                if (o.orderId === order.orderId) {
                    return {
                        ...o,
                        status: 'returned',
                        returnedAt: new Date().toISOString(),
                        returnedAtTimestamp: Date.now(),
                        refundStatus: 'pending', // Ödeme iadesi beklemede
                        updatedAt: new Date().toISOString(),
                        updatedAtTimestamp: Date.now()
                    }
                }
                return o
            })

            await userRef.update({ orders: updatedOrders })

            // Orders collection'ındaki siparişi de güncelle (senkronizasyon için)
            try {
                const orderRef = db.collection('orders').doc(order.orderId)
                await orderRef.update({
                    status: 'returned',
                    returnedAt: new Date().toISOString(),
                    refundStatus: 'pending',
                    updatedAt: new Date().toISOString()
                })
            } catch (err) {
                console.warn('Orders collection güncellenemedi:', err)
            }

            // İade edilen siparişin ürün stoklarını geri ekle (stok yönetimi)
            try {
                console.log('İade edilen sipariş için stoklar geri artırılıyor...')
                const batch = db.batch()
                let stockUpdateCount = 0
                
                if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                        // Ürün ID'sini belirle (öncelik sırası: originalId > productId > id)
                        const productId = item.originalId || item.productId || item.id
                        if (!productId) {
                            console.warn('  ⚠️ Ürün ID bulunamadı:', item)
                            continue
                        }
                        
                        const productRef = db.collection('products').doc(productId.toString())
                        const productDoc = await productRef.get()
                        
                        if (productDoc.exists) {
                            const productData = productDoc.data()
                            const currentStock = typeof productData.stock === 'number' 
                                ? productData.stock 
                                : parseInt(productData.stock, 10) || 0
                            
                            const quantityToRestore = item.quantity || 1
                            const newStock = currentStock + quantityToRestore
                            
                            batch.update(productRef, {
                                stock: newStock,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                            
                            stockUpdateCount++
                            console.log(`  - Ürün ${productId}: ${currentStock} → ${newStock} (${quantityToRestore} adet eklendi)`)
                        } else {
                            console.warn(`  ⚠️ Ürün bulunamadı: ${productId}`)
                        }
                    }
                    
                    if (stockUpdateCount > 0) {
                        await batch.commit()
                        console.log(`✅ ${stockUpdateCount} ürünün stoku geri artırıldı`)
                    }
                }
            } catch (stockError) {
                console.error('❌ Stok geri artırma hatası:', stockError)
                // Not: Stok güncelleme hatası sipariş iadesini engellemez, sadece loglanır
            }

            Swal.fire({
                title: 'Başarılı',
                text: 'İade talebi oluşturuldu, stoklar geri artırıldı. Ödeme iadesi işleme alınacaktır.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                document.body.style.overflow = 'auto'
            })

            // Order'ları yeniden yükle
            const currentUserAfter = auth.currentUser
            if (currentUserAfter) {
                loadOrders(currentUserAfter)
            }
        } catch (error) {
            console.error('❌ Sipariş iade hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Sipariş iade edilirken bir hata oluştu.',
                icon: 'error'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
        }
    }, [loadOrders])

    /**
     * Kullanıcı giriş yapmamışsa hiçbir şey render etme
     * Bu durumda auth state listener zaten login sayfasına yönlendirecek
     */
    if (!status) {
        return null;
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
            <Header />
            <section className="ptb-100" style={{ paddingTop: '120px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="profile-content">
                                {/* Kullanıcı Bilgileri */}
                                <div className="card shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <h3 className="mb-4 text-center">Profil Bilgilerim</h3>
                                        
                                        <div className="profile-info mb-4">
                                            <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                <h5 className="mb-2">Kullanıcı Adı</h5>
                                                <p className="mb-0 text-muted">{user.name || 'N/A'}</p>
                                            </div>
                                            
                                            <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                <h5 className="mb-2">E-posta</h5>
                                                <p className="mb-0 text-muted">{user.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Siparişler */}
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Siparişlerim</h4>
                                        
                                        {loading ? (
                                            <p>Yükleniyor...</p>
                                        ) : error ? (
                                            <>
                                                <p style={{ color: 'red' }}>{error}</p>
                                                <button 
                                                    className="btn btn-primary" 
                                                    onClick={loadOrders}
                                                    style={{ marginTop: '10px' }}
                                                >
                                                    Tekrar Dene
                                                </button>
                                            </>
                                        ) : orders.length === 0 ? (
                                            <div className="alert alert-info">
                                                <p className="mb-0">Henüz siparişiniz bulunmuyor.</p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead className="thead-dark">
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
                                                            const orderStatus = order.status || 'processing'
                                                            
                                                            // Sipariş durumunu kontrol et (buton görünürlüğü için)
                                                            const isDelivered = orderStatus === 'delivered' || orderStatus === 'Teslim Edildi'
                                                            const isProcessing = orderStatus === 'processing' || orderStatus === 'İşleniyor'
                                                            const isCancelled = orderStatus === 'cancelled' || orderStatus === 'İptal Edildi'
                                                            const isReturned = orderStatus === 'returned' || orderStatus === 'refunded' || orderStatus === 'İade Edildi'
                                                            
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
                                                                        {!isAdmin && isProcessing && !isCancelled && (
                                                                            <button
                                                                                className="btn btn-sm btn-danger"
                                                                                onClick={() => cancelOrder(order)}
                                                                                style={{ marginRight: '5px' }}
                                                                            >
                                                                                İptal Et
                                                                            </button>
                                                                        )}
                                                                        {!isAdmin && isDelivered && !isReturned && (
                                                                            <>
                                                                                <button
                                                                                    className="btn btn-sm btn-danger"
                                                                                    onClick={() => returnOrder(order)}
                                                                                    style={{ marginRight: '5px' }}
                                                                                >
                                                                                    İade Et
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-sm btn-warning"
                                                                                    onClick={() => openReviewModal(order)}
                                                                                    style={{ marginRight: '5px' }}
                                                                                >
                                                                                    ⭐ Değerlendir
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {isAdmin && isDelivered && !isReturned && (
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Profile

