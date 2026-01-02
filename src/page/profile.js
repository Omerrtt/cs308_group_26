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

// Admin UID
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
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        taxID: '',
        homeAddress: {
            address: '',
            city: '',
            zipCode: '',
            country: 'Türkiye'
        }
    })
    const [savingProfile, setSavingProfile] = useState(false)
    const [addresses, setAddresses] = useState([])

    // Body scroll'u kontrol et ve düzelt
    useEffect(() => {
        document.body.style.overflow = 'auto'
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [])

    // Profil bilgilerini yükle
    const loadProfileData = useCallback(async (currentUser) => {
        try {
            if (!currentUser) return;
            
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Adresleri yükle
                const userAddresses = userData.addresses || [];
                setAddresses(userAddresses);
                
                // Home address'i belirle - eğer homeAddress yoksa, default adresi veya ilk adresi kullan
                let homeAddress = userData.homeAddress;
                if (!homeAddress && userAddresses.length > 0) {
                    const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
                    if (defaultAddress) {
                        homeAddress = {
                            address: defaultAddress.address || defaultAddress.fullAddress || '',
                            city: defaultAddress.city || '',
                            zipCode: defaultAddress.zipCode || '',
                            country: defaultAddress.country || 'Türkiye',
                            addressId: defaultAddress.id // Hangi adresin seçili olduğunu takip etmek için
                        };
                    }
                }
                
                setProfileData({
                    name: userData.name || user.displayName || '',
                    email: userData.email || currentUser.email || '',
                    taxID: userData.taxID || '',
                    homeAddress: homeAddress || {
                        address: '',
                        city: '',
                        zipCode: '',
                        country: 'Türkiye',
                        addressId: null
                    }
                });
            } else {
                // Kullanıcı dokümanı yoksa, mevcut bilgileri kullan
                setProfileData({
                    name: user.displayName || currentUser.email?.split('@')[0] || '',
                    email: currentUser.email || '',
                    taxID: '',
                    homeAddress: {
                        address: '',
                        city: '',
                        zipCode: '',
                        country: 'Türkiye',
                        addressId: null
                    }
                });
                setAddresses([]);
            }
        } catch (error) {
            console.error('Profil bilgileri yüklenirken hata:', error);
        }
    }, []);

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

    // Auth state'i bekle ve order'ları yükle
    useEffect(() => {
        // Firebase auth state'i bekleyelim
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                // Kullanıcı giriş yapmamış - login sayfasına yönlendir
                history.push('/login')
                setLoading(false)
                return
            }

            // Admin kontrolü
            setIsAdmin(currentUser.uid === ADMIN_UID)

            // Profil bilgilerini yükle (adresler de dahil)
            await loadProfileData(currentUser)

            // Kullanıcı giriş yapmış - order'ları yükle
            await loadOrders(currentUser)
        })

        // Cleanup
        return () => unsubscribe()
    }, [history, loadOrders, loadProfileData])

    // Format date
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

    // Format price
    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0)
    }, [])

    // Status map
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

    // Invoice indir
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

    // Order detaylarını göster
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

    // Review modal'ı aç
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
        // Order'ları yeniden yükle
        const currentUser = auth.currentUser
        if (currentUser) {
            loadOrders(currentUser)
        }
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

    // Return/Refund order - only for delivered status
    // Profil bilgilerini kaydet
    const saveProfileData = useCallback(async () => {
        setSavingProfile(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Swal.fire({
                    title: 'Hata',
                    text: 'Kullanıcı giriş yapmamış.',
                    icon: 'error'
                });
                return;
            }

            // Validasyon
            if (!profileData.name || !profileData.email) {
                Swal.fire({
                    title: 'Hata',
                    text: 'Lütfen ad ve e-posta alanlarını doldurun.',
                    icon: 'warning'
                });
                setSavingProfile(false);
                return;
            }

            // Firebase'de kullanıcı bilgilerini güncelle
            const userRef = db.collection('users').doc(currentUser.uid);
            
            // Home address'i kaydet (addressId'yi saklama, sadece adres bilgilerini)
            const homeAddressToSave = {
                address: profileData.homeAddress.address || '',
                city: profileData.homeAddress.city || '',
                zipCode: profileData.homeAddress.zipCode || '',
                country: profileData.homeAddress.country || 'Türkiye'
            };
            
            await userRef.set({
                name: profileData.name,
                email: profileData.email,
                taxID: profileData.taxID || '',
                homeAddress: homeAddressToSave,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Firebase Auth'ta displayName'i güncelle
            await currentUser.updateProfile({
                displayName: profileData.name
            });

            Swal.fire({
                title: 'Başarılı',
                text: 'Profil bilgileri güncellendi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setIsEditingProfile(false);
            
            // Profil bilgilerini yeniden yükle
            const currentUserAfter = auth.currentUser;
            if (currentUserAfter) {
                await loadProfileData(currentUserAfter);
            }
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Profil bilgileri güncellenirken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setSavingProfile(false);
        }
    }, [profileData, loadProfileData]);

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
                await orderRef.update({
                    status: 'returned',
                    returnedAt: new Date().toISOString(),
                    refundStatus: 'pending',
                    updatedAt: new Date().toISOString()
                })
            } catch (err) {
                console.warn('Orders collection güncellenemedi:', err)
            }

            Swal.fire({
                title: 'Başarılı',
                text: 'İade talebi oluşturuldu. Sales Manager tarafından onaylandıktan sonra stoklar geri artırılacak ve ödeme iadesi yapılacaktır.',
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
    }, [loadOrders, getReturnDaysRemaining])

    // If user is not authenticated, don't render anything
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
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Profil Bilgilerim</h3>
                                            {!isEditingProfile && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => setIsEditingProfile(true)}
                                                >
                                                    <i className="fa fa-edit me-2"></i>Düzenle
                                                </button>
                                            )}
                                        </div>
                                        
                                        {isEditingProfile ? (
                                            <div className="profile-edit-form">
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Kullanıcı Adı *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.name}
                                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">E-posta *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={profileData.email}
                                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Vergi Numarası (Tax ID)</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.taxID}
                                                            onChange={(e) => setProfileData({...profileData, taxID: e.target.value})}
                                                            placeholder="Örn: 1234567890"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="row mb-3">
                                                    <div className="col-12">
                                                        <label className="form-label">Ev Adresi</label>
                                                        {addresses.length > 0 ? (
                                                            <select
                                                                className="form-select mb-2"
                                                                value={profileData.homeAddress.addressId || ''}
                                                                onChange={(e) => {
                                                                    const selectedAddressId = e.target.value;
                                                                    if (selectedAddressId) {
                                                                        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                                                                        if (selectedAddress) {
                                                                            setProfileData({
                                                                                ...profileData,
                                                                                homeAddress: {
                                                                                    address: selectedAddress.address || selectedAddress.fullAddress || '',
                                                                                    city: selectedAddress.city || '',
                                                                                    zipCode: selectedAddress.zipCode || '',
                                                                                    country: selectedAddress.country || 'Türkiye',
                                                                                    addressId: selectedAddress.id
                                                                                }
                                                                            });
                                                                        }
                                                                    } else {
                                                                        // Yeni adres seçeneği
                                                                        setProfileData({
                                                                            ...profileData,
                                                                            homeAddress: {
                                                                                address: '',
                                                                                city: '',
                                                                                zipCode: '',
                                                                                country: 'Türkiye',
                                                                                addressId: null
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Yeni Adres Ekle</option>
                                                                {addresses.map((addr) => (
                                                                    <option key={addr.id} value={addr.id}>
                                                                        {addr.fullName || addr.firstName + ' ' + addr.lastName} - {addr.address || addr.fullAddress} {addr.city ? `, ${addr.city}` : ''}
                                                                        {addr.isDefault && ' (Varsayılan)'}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <p className="text-muted small mb-2">Henüz kayıtlı adresiniz yok. Checkout sayfasından adres ekleyebilirsiniz.</p>
                                                        )}
                                                    </div>
                                                    <div className="col-md-8 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.homeAddress.address}
                                                            onChange={(e) => setProfileData({
                                                                ...profileData,
                                                                homeAddress: {...profileData.homeAddress, address: e.target.value, addressId: null}
                                                            })}
                                                            placeholder="Sokak, Cadde, Bina No"
                                                            disabled={profileData.homeAddress.addressId && addresses.length > 0}
                                                        />
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.homeAddress.zipCode}
                                                            onChange={(e) => setProfileData({
                                                                ...profileData,
                                                                homeAddress: {...profileData.homeAddress, zipCode: e.target.value, addressId: null}
                                                            })}
                                                            placeholder="Posta Kodu"
                                                            disabled={profileData.homeAddress.addressId && addresses.length > 0}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.homeAddress.city}
                                                            onChange={(e) => setProfileData({
                                                                ...profileData,
                                                                homeAddress: {...profileData.homeAddress, city: e.target.value, addressId: null}
                                                            })}
                                                            placeholder="Şehir"
                                                            disabled={profileData.homeAddress.addressId && addresses.length > 0}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={profileData.homeAddress.country}
                                                            onChange={(e) => setProfileData({
                                                                ...profileData,
                                                                homeAddress: {...profileData.homeAddress, country: e.target.value, addressId: null}
                                                            })}
                                                            placeholder="Ülke"
                                                            disabled={profileData.homeAddress.addressId && addresses.length > 0}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setIsEditingProfile(false);
                                                            // Değişiklikleri geri al
                                                            const currentUser = auth.currentUser;
                                                            if (currentUser) {
                                                                loadProfileData(currentUser);
                                                            }
                                                        }}
                                                        disabled={savingProfile}
                                                    >
                                                        İptal
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={saveProfileData}
                                                        disabled={savingProfile}
                                                    >
                                                        {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="profile-info mb-4">
                                                <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                    <h5 className="mb-2">Kullanıcı Adı</h5>
                                                    <p className="mb-0 text-muted">{profileData.name || user.name || 'N/A'}</p>
                                                </div>
                                                
                                                <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                    <h5 className="mb-2">E-posta</h5>
                                                    <p className="mb-0 text-muted">{profileData.email || user.email || 'N/A'}</p>
                                                </div>
                                                
                                                {profileData.taxID && (
                                                    <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                        <h5 className="mb-2">Vergi Numarası (Tax ID)</h5>
                                                        <p className="mb-0 text-muted">{profileData.taxID}</p>
                                                    </div>
                                                )}
                                                
                                                {profileData.homeAddress && profileData.homeAddress.address && (
                                                    <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                        <h5 className="mb-2">Ev Adresi</h5>
                                                        <p className="mb-0 text-muted">
                                                            {profileData.homeAddress.address}
                                                            {profileData.homeAddress.city && `, ${profileData.homeAddress.city}`}
                                                            {profileData.homeAddress.zipCode && ` ${profileData.homeAddress.zipCode}`}
                                                            {profileData.homeAddress.country && `, ${profileData.homeAddress.country}`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

