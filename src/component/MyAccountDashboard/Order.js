import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { auth, db } from '../../firebaseConfig'
import firebase from 'firebase/app'
import { generateInvoicePDF } from '../../utils/invoiceGenerator'
import Swal from 'sweetalert2'
import ReviewModal from './ReviewModal'

// Admin UID
const ADMIN_UID = 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';

const Order = () => {
    const status = useSelector((state) => state.user.status)
    const [orders, setOrders] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)

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
        // Admin kontrolü
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setIsAdmin(currentUser.uid === ADMIN_UID)
            } else {
                setIsAdmin(false)
            }
        })

        if (status) {
            loadOrders()
        } else {
            setLoading(false)
            setOrders([])
            setInvoices([])
        }

        return () => unsubscribe()
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/67e2e45d-e2d0-4eec-88e2-0c404d5839a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'INV0',location:'MyAccountDashboard/Order.js:138',message:'downloadInvoice invoked',data:{orderId,totalInvoices:invoices.length},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
        try {
            // İlgili invoice'u bul
            const invoice = invoices.find(inv => inv.orderId === orderId)
            
            if (!invoice) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/67e2e45d-e2d0-4eec-88e2-0c404d5839a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'INV3',location:'MyAccountDashboard/Order.js:145',message:'invoice not found',data:{orderId},timestamp:Date.now()})}).catch(()=>{})
                // #endregion
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
            
            // PDF'i yeni sekmede aç
            const pdfUrl = URL.createObjectURL(invoicePDFBlob)

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/67e2e45d-e2d0-4eec-88e2-0c404d5839a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'INV1',location:'MyAccountDashboard/Order.js:159',message:'invoice PDF created',data:{orderId,invoiceNumber:invoice.invoiceNumber||invoice.invoiceId,blobSize:invoicePDFBlob.size},timestamp:Date.now()})}).catch(()=>{})
            // #endregion

            const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/67e2e45d-e2d0-4eec-88e2-0c404d5839a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'INV2',location:'MyAccountDashboard/Order.js:165',message:'window.open result',data:{orderId,opened:!!openedWindow},timestamp:Date.now()})}).catch(()=>{})
            // #endregion
            
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl)
            }, 5000)
            
            Swal.fire({
                title: 'Başarılı',
                text: openedWindow ? 'Fatura yeni sekmede açıldı.' : 'Fatura hazırlandı. Eğer sekme açılmadıysa tarayıcı açılır pencere engelini kontrol edin.',
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

    // Cancel order - only for processing status
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

            // Orders collection'ı da güncelle (eğer varsa)
            try {
                const orderRef = db.collection('orders').doc(order.orderId)
                const orderDoc = await orderRef.get()
                
                if (orderDoc.exists) {
                    const orderData = orderDoc.data()
                    // Sadece processing durumundaki order'ları cancelled yap
                    if (orderData.status === 'processing') {
                        await orderRef.update({
                            status: 'cancelled',
                            cancelledAt: new Date().toISOString(),
                            cancelledAtTimestamp: Date.now(),
                            updatedAt: new Date().toISOString(),
                            updatedAtTimestamp: Date.now()
                        })
                        console.log('✅ Orders collection güncellendi:', order.orderId)
                    } else {
                        console.warn('⚠️ Order zaten processing durumunda değil:', orderData.status)
                    }
                } else {
                    console.warn('⚠️ Orders collection\'da order bulunamadı:', order.orderId)
                }
            } catch (err) {
                console.error('❌ Orders collection güncellenemedi:', err)
                // Hata durumunda kullanıcıya bilgi ver ama sipariş iptalini engelleme
            }

            // Ürün stoklarını geri artır
            try {
                console.log('İptal edilen sipariş için stoklar geri artırılıyor...')
                const batch = db.batch()
                let stockUpdateCount = 0
                
                if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                        // Ürün ID'sini al (originalId varsa onu kullan, yoksa productId veya id)
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
                // Stok hatası sipariş iptalini engellemez, sadece log'lar
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
            loadOrders()
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

    // İade süresini hesapla (30 gün)
    const getReturnDaysRemaining = useCallback((order) => {
        if (!order) return null
        
        // Order date'i al
        let orderDate;
        if (order.orderDateTimestamp) {
            orderDate = new Date(order.orderDateTimestamp);
        } else if (order.orderDate) {
            // Firebase Timestamp kontrolü
            if (order.orderDate.toDate) {
                orderDate = order.orderDate.toDate();
            } else if (typeof order.orderDate === 'string') {
                orderDate = new Date(order.orderDate);
            } else if (typeof order.orderDate === 'number') {
                orderDate = new Date(order.orderDate);
            } else {
                orderDate = new Date(order.orderDate);
            }
        } else if (order.createdAt) {
            if (order.createdAt.toDate) {
                orderDate = order.createdAt.toDate();
            } else if (typeof order.createdAt === 'string') {
                orderDate = new Date(order.createdAt);
            } else if (typeof order.createdAt === 'number') {
                orderDate = new Date(order.createdAt);
            } else {
                orderDate = new Date(order.createdAt);
            }
        } else {
            return null;
        }
        
        if (isNaN(orderDate.getTime())) {
            return null;
        }
        
        // 30 gün sonrasını hesapla
        const returnDeadline = new Date(orderDate);
        returnDeadline.setDate(returnDeadline.getDate() + 30);
        
        // Bugünün tarihi
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        returnDeadline.setHours(23, 59, 59, 999);
        
        // Kalan gün sayısı
        const diffTime = returnDeadline - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            daysRemaining: diffDays,
            isExpired: diffDays < 0,
            deadline: returnDeadline
        };
    }, []);

    // Return/Refund order - only for delivered status and within 30 days
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
        
        // İade süresi kontrolü (30 gün)
        const returnInfo = getReturnDaysRemaining(order);
        if (!returnInfo || returnInfo.isExpired || returnInfo.daysRemaining <= 0) {
            Swal.fire({
                title: 'İade Süresi Doldu',
                text: 'Üzgünüz, sipariş tarihinden itibaren 30 gün geçtiği için bu siparişi iade edemezsiniz.',
                icon: 'error',
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
            
            // Order'ı bul ve güncelle
            const updatedOrders = orders.map((o) => {
                if (o.orderId === order.orderId) {
                    return {
                        ...o,
                        status: 'returned',
                        returnedAt: new Date().toISOString(),
                        returnedAtTimestamp: Date.now(),
                        refundStatus: 'pending',
                        updatedAt: new Date().toISOString(),
                        updatedAtTimestamp: Date.now()
                    }
                }
                return o
            })

            await userRef.update({ orders: updatedOrders })

            // Orders collection'ı da güncelle (eğer varsa)
            try {
                const orderRef = db.collection('orders').doc(order.orderId)
                const orderDoc = await orderRef.get()
                
                if (orderDoc.exists) {
                    const orderData = orderDoc.data()
                    // Sadece delivered durumundaki order'ları returned yap
                    if (orderData.status === 'delivered') {
                        await orderRef.update({
                            status: 'returned',
                            returnedAt: new Date().toISOString(),
                            returnedAtTimestamp: Date.now(),
                            refundStatus: 'pending',
                            updatedAt: new Date().toISOString(),
                            updatedAtTimestamp: Date.now()
                        })
                        console.log('✅ Orders collection güncellendi:', order.orderId)
                    } else {
                        console.warn('⚠️ Order zaten delivered durumunda değil:', orderData.status)
                    }
                } else {
                    console.warn('⚠️ Orders collection\'da order bulunamadı:', order.orderId)
                }
            } catch (err) {
                console.error('❌ Orders collection güncellenemedi:', err)
                // Hata durumunda kullanıcıya bilgi ver ama sipariş iadesini engelleme
            }

            // Ürün stoklarını geri artır
            try {
                console.log('İade edilen sipariş için stoklar geri artırılıyor...')
                const batch = db.batch()
                let stockUpdateCount = 0
                
                if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                        // Ürün ID'sini al (originalId varsa onu kullan, yoksa productId veya id)
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
                // Stok hatası sipariş iadesini engellemez, sadece log'lar
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
            loadOrders()
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
    }, [loadOrders, getReturnDaysRemaining])

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
                                    
                                    // Status kontrolü
                                    const isDelivered = orderStatus === 'delivered' || orderStatus === 'Teslim Edildi'
                                    const isProcessing = orderStatus === 'processing' || orderStatus === 'İşleniyor'
                                    const isCancelled = orderStatus === 'cancelled' || orderStatus === 'İptal Edildi'
                                    const isReturned = orderStatus === 'returned' || orderStatus === 'refunded' || orderStatus === 'İade Edildi'
                                    
                                    // İade süresi kontrolü
                                    const returnInfo = getReturnDaysRemaining(order)
                                    const canReturn = isDelivered && !isReturned && returnInfo && !returnInfo.isExpired && returnInfo.daysRemaining > 0
                                    
                                    return (
                                        <tr key={order.orderId || index}>
                                            <td>{order.orderId || 'N/A'}</td>
                                            <td>{formatDate(order.orderDate || order.createdAt)}</td>
                                            <td>
                                                {getStatusBadge(orderStatus)}
                                                {isDelivered && !isReturned && returnInfo && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        {returnInfo.isExpired || returnInfo.daysRemaining <= 0 ? (
                                                            <span className="badge bg-secondary" style={{ fontSize: '11px' }}>
                                                                İade süresi doldu
                                                            </span>
                                                        ) : (
                                                            <span className={`badge ${returnInfo.daysRemaining <= 5 ? 'bg-warning' : 'bg-info'}`} style={{ fontSize: '11px' }}>
                                                                İade için son {returnInfo.daysRemaining} gün
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
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
                                                {!isAdmin && canReturn && (
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
                                                {!isAdmin && isDelivered && !isReturned && !canReturn && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => openReviewModal(order)}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        ⭐ Değerlendir
                                                    </button>
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
        </>
    )
}

export default Order