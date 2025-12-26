import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth, db } from '../../firebaseConfig';
import Header from '../../component/Common/Header';
import Footer from '../../component/Common/Footer';
import Swal from 'sweetalert2';

// Admin UID - Sadece bu kullanıcı erişebilir
const ADMIN_UID = 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';

const AdminPanel = () => {
    const history = useHistory();
    const status = useSelector((state) => state.user.status);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [pendingComments, setPendingComments] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' veya 'comments'

    useEffect(() => {
        // Admin kontrolü - Firebase auth state'i bekleyelim
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            console.log('🔐 Auth state değişti, admin kontrolü yapılıyor...');
            console.log('Current User UID:', currentUser?.uid);
            console.log('Admin UID:', ADMIN_UID);
            
            if (!currentUser) {
                console.log('❌ Kullanıcı giriş yapmamış');
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya erişmek için giriş yapmanız gerekiyor.',
                    icon: 'error',
                    confirmButtonText: 'Giriş Yap'
                }).then(() => {
                    history.push('/login');
                });
                setLoading(false);
                return;
            }
            
            if (currentUser.uid !== ADMIN_UID) {
                console.log('❌ Kullanıcı admin değil');
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya sadece admin erişebilir.',
                    icon: 'error',
                    confirmButtonText: 'Ana Sayfaya Dön'
                }).then(() => {
                    history.push('/');
                });
                setLoading(false);
                return;
            }

            console.log('✅ Admin doğrulandı');
            setIsAdmin(true);
            await loadAllOrders();
            await loadPendingComments();
            setLoading(false);
        });

        // Cleanup
        return () => unsubscribe();
    }, [history]);

    // Tüm kullanıcıların order'larını çek
    const loadAllOrders = async () => {
        try {
            console.log('📦 Tüm siparişler yükleniyor...');
            
            // Önce orders collection'ından çek (ana kaynak)
            const ordersSnapshot = await db.collection('orders').get();
            const ordersList = [];
            const userIds = new Set();

            ordersSnapshot.forEach((doc) => {
                const orderData = doc.data();
                ordersList.push({
                    ...orderData,
                    // Document ID'yi de ekle (orderId ile aynı olmalı)
                    documentId: doc.id
                });
                
                // User ID'leri topla (kullanıcı bilgilerini çekmek için)
                if (orderData.userId) {
                    userIds.add(orderData.userId);
                }
            });

            console.log(`📦 Orders collection'dan ${ordersList.length} sipariş bulundu`);

            // Kullanıcı bilgilerini çek
            const usersMap = {};
            if (userIds.size > 0) {
                const userIdsArray = Array.from(userIds);
                const userPromises = userIdsArray.map(async (userId) => {
                    try {
                        const userDoc = await db.collection('users').doc(userId).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            usersMap[userId] = {
                                name: userData.name || 'İsimsiz',
                                email: userData.email || 'Email yok',
                                uid: userId
                            };
                        } else {
                            usersMap[userId] = {
                                name: 'Bilinmeyen Kullanıcı',
                                email: 'Email yok',
                                uid: userId
                            };
                        }
                    } catch (error) {
                        console.error(`Kullanıcı ${userId} bilgisi alınamadı:`, error);
                        usersMap[userId] = {
                            name: 'Bilinmeyen Kullanıcı',
                            email: 'Email yok',
                            uid: userId
                        };
                    }
                });
                await Promise.all(userPromises);
            }

            // Order'lara kullanıcı bilgilerini ekle
            const ordersWithUserInfo = ordersList.map(order => ({
                ...order,
                userName: order.userName || usersMap[order.userId]?.name || 'İsimsiz',
                userEmail: order.userEmail || usersMap[order.userId]?.email || 'Email yok'
            }));

            // Order'ları tarihe göre sırala (en yeni önce)
            ordersWithUserInfo.sort((a, b) => {
                const dateA = a.orderDateTimestamp || a.createdAtTimestamp || 0;
                const dateB = b.orderDateTimestamp || b.createdAtTimestamp || 0;
                return dateB - dateA;
            });

            setUsers(usersMap);
            setAllOrders(ordersWithUserInfo);
            console.log(`✅ ${ordersWithUserInfo.length} sipariş yüklendi (orders collection'dan)`);
        } catch (error) {
            console.error('❌ Order yükleme hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Siparişler yüklenirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Order status'unu güncelle
    const updateOrderStatus = async (userId, orderId, newStatus) => {
        try {
            const updateTime = new Date();
            const updateData = {
                status: newStatus,
                updatedAt: updateTime.toISOString(),
                updatedAtTimestamp: updateTime.getTime()
            };

            // Orders collection'ındaki order'ı güncelle (ana kaynak)
            const orderRef = db.collection('orders').doc(orderId);
            await orderRef.update(updateData);
            console.log(`✅ Orders collection'daki order güncellendi: ${orderId}`);

            // Users collection'ındaki orders array'ini de güncelle (senkronizasyon için)
            try {
                console.log(`🔄 Users collection güncelleniyor...`);
                console.log(`   User ID: ${userId}`);
                console.log(`   Order ID: ${orderId}`);
                
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();
                
                if (!userDoc.exists) {
                    console.warn(`⚠️ User document bulunamadı: ${userId}`);
                    throw new Error(`User document bulunamadı: ${userId}`);
                }

                const userData = userDoc.data();
                const orders = userData.orders || [];
                
                console.log(`   Mevcut orders sayısı: ${orders.length}`);
                
                // Order'ı bul
                let orderFound = false;
                const updatedOrders = orders.map((order, index) => {
                    const orderIdMatch = order.orderId === orderId;
                    if (orderIdMatch) {
                        orderFound = true;
                        console.log(`   ✅ Order bulundu (index: ${index}), güncelleniyor...`);
                        console.log(`   Eski status: ${order.status}`);
                        console.log(`   Yeni status: ${newStatus}`);
                        return {
                            ...order,
                            ...updateData
                        };
                    }
                    return order;
                });

                if (!orderFound) {
                    console.error(`❌ Order bulunamadı! Order ID: ${orderId}`);
                    console.error(`   Mevcut order ID'leri:`, orders.map(o => o.orderId));
                    throw new Error(`Order bulunamadı: ${orderId}`);
                }

                console.log(`   Güncellenmiş orders sayısı: ${updatedOrders.length}`);
                await userRef.update({ orders: updatedOrders });
                console.log(`✅ Users collection'daki order güncellendi: ${orderId}`);
            } catch (userUpdateError) {
                console.error('❌ Users collection güncelleme hatası:', userUpdateError);
                console.error('   Hata detayları:', {
                    message: userUpdateError.message,
                    code: userUpdateError.code,
                    stack: userUpdateError.stack
                });
                // Users collection güncelleme hatası kritik değil, orders collection güncellendi
                // Ancak kullanıcıya bilgi verelim
                Swal.fire({
                    icon: 'warning',
                    title: 'Kısmi Güncelleme',
                    text: 'Orders collection güncellendi ancak users collection güncellenirken bir hata oluştu. Lütfen console loglarını kontrol edin.',
                    timer: 5000,
                    showConfirmButton: true
                });
            }
            
            // Local state'i güncelle
            setAllOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderId === orderId
                        ? { ...order, ...updateData }
                        : order
                )
            );

            Swal.fire({
                title: 'Başarılı',
                text: 'Sipariş durumu güncellendi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Order status güncelleme hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Sipariş durumu güncellenirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Tarih yok';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0);
    };

    // Bekleyen comment'leri yükle
    const loadPendingComments = async () => {
        try {
            console.log('💬 Bekleyen yorumlar yükleniyor...');
            const usersSnapshot = await db.collection('users').get();
            const allPendingComments = [];

            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                const notApprovedComments = userData.notApprovedComments || [];
                
                notApprovedComments.forEach((comment) => {
                    allPendingComments.push({
                        ...comment,
                        userId: userDoc.id,
                        userName: userData.name || 'İsimsiz',
                        userEmail: userData.email || 'Email yok'
                    });
                });
            });

            // Tarihe göre sırala (en yeni önce)
            allPendingComments.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            setPendingComments(allPendingComments);
            console.log(`✅ ${allPendingComments.length} bekleyen yorum yüklendi`);
        } catch (error) {
            console.error('❌ Bekleyen yorumlar yüklenirken hata:', error);
        }
    };

    // Comment'i onayla
    const approveComment = async (comment, userId) => {
        try {
            Swal.fire({
                title: 'Yorum Onaylanıyor...',
                text: 'Lütfen bekleyin.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const batch = db.batch();
            
            // 1. Product'a comment ekle
            const productRef = db.collection('products').doc(comment.productId);
            const productDoc = await productRef.get();
            const productData = productDoc.data() || {};
            
            const approvedComments = productData.approvedComments || [];
            const newApprovedComment = {
                id: comment.id,
                userId: comment.userId,
                userName: comment.userName,
                productId: comment.productId,
                orderId: comment.orderId,
                comment: comment.comment,
                createdAt: comment.createdAt,
                approvedAt: new Date().toISOString()
            };
            
            approvedComments.push(newApprovedComment);
            batch.update(productRef, {
                approvedComments: approvedComments,
                updatedAt: new Date().toISOString()
            });

            // 2. User'dan notApprovedComments'ten kaldır
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};
            const notApprovedComments = userData.notApprovedComments || [];
            const filteredComments = notApprovedComments.filter(c => c.id !== comment.id);
            
            batch.update(userRef, {
                notApprovedComments: filteredComments
            });

            await batch.commit();

            // Local state'i güncelle
            setPendingComments(prev => prev.filter(c => c.id !== comment.id));

            Swal.fire({
                title: 'Başarılı',
                text: 'Yorum onaylandı ve ürün sayfasında yayınlandı.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('❌ Yorum onaylama hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Yorum onaylanırken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Comment'i reddet
    const rejectComment = async (comment, userId) => {
        try {
            const result = await Swal.fire({
                title: 'Yorumu Reddet',
                text: 'Bu yorumu silmek istediğinize emin misiniz?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, Sil',
                cancelButtonText: 'İptal'
            });

            if (!result.isConfirmed) return;

            // User'dan notApprovedComments'ten kaldır
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};
            const notApprovedComments = userData.notApprovedComments || [];
            const filteredComments = notApprovedComments.filter(c => c.id !== comment.id);
            
            await userRef.update({
                notApprovedComments: filteredComments
            });

            // Local state'i güncelle
            setPendingComments(prev => prev.filter(c => c.id !== comment.id));

            Swal.fire({
                title: 'Başarılı',
                text: 'Yorum silindi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('❌ Yorum silme hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Yorum silinirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="ptb-100" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h2>Yükleniyor...</h2>
                </div>
                <Footer />
            </>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-title text-center mb-50">
                                <h2>Admin Paneli</h2>
                                <p>Tüm siparişleri görüntüleyin ve yönetin</p>
                            </div>

                            {/* Upload Products Butonu */}
                            <div className="mb-4 text-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => history.push('/admin/upload-products')}
                                    style={{
                                        padding: '12px 30px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        marginRight: '10px'
                                    }}
                                >
                                    📦 Ürün Yükle
                                </button>
                            </div>

                            {/* Tab Navigation */}
                            <div className="mb-4">
                                <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #dee2e6' }}>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('orders')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '10px 20px',
                                                cursor: 'pointer',
                                                borderBottom: activeTab === 'orders' ? '2px solid #007bff' : 'none',
                                                color: activeTab === 'orders' ? '#007bff' : '#666'
                                            }}
                                        >
                                            📦 Siparişler ({allOrders.length})
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('comments')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '10px 20px',
                                                cursor: 'pointer',
                                                borderBottom: activeTab === 'comments' ? '2px solid #007bff' : 'none',
                                                color: activeTab === 'comments' ? '#007bff' : '#666'
                                            }}
                                        >
                                            💬 Bekleyen Yorumlar ({pendingComments.length})
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Orders Tab Content */}
                            {activeTab === 'orders' && (
                                <>
                            {/* İstatistikler */}
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <h3>{allOrders.length}</h3>
                                        <p className="mb-0">Toplam Sipariş</p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
                                        <h3>{allOrders.filter(o => o.status === 'processing').length}</h3>
                                        <p className="mb-0">İşleniyor</p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ padding: '20px', background: '#cfe2ff', borderRadius: '8px' }}>
                                        <h3>{allOrders.filter(o => o.status === 'in-transit').length}</h3>
                                        <p className="mb-0">Yolda</p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ padding: '20px', background: '#d4edda', borderRadius: '8px' }}>
                                        <h3>{allOrders.filter(o => o.status === 'delivered').length}</h3>
                                        <p className="mb-0">Teslim Edildi</p>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ padding: '20px', background: '#f8d7da', borderRadius: '8px' }}>
                                        <h3>{allOrders.filter(o => o.status === 'cancelled').length}</h3>
                                        <p className="mb-0">İptal Edildi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Siparişler Tablosu */}
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Sipariş ID</th>
                                            <th>Fatura No</th>
                                            <th>Müşteri</th>
                                            <th>Email</th>
                                            <th>Tarih</th>
                                            <th>Ürünler</th>
                                            <th>Toplam</th>
                                            <th>Durum</th>
                                            <th>Adres</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="10" className="text-center">
                                                    <p className="mb-0">Henüz sipariş bulunmuyor.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            allOrders.map((order, index) => (
                                                <tr key={`${order.orderId || order.documentId || index}`}>
                                                    <td>
                                                        <strong>{order.orderId || 'N/A'}</strong>
                                                    </td>
                                                    <td>
                                                        <small>{order.invoiceNumber || 'N/A'}</small>
                                                    </td>
                                                    <td>{order.userName || 'İsimsiz'}</td>
                                                    <td>{order.userEmail || 'Email yok'}</td>
                                                    <td>{formatDate(order.orderDate || order.createdAt)}</td>
                                                    <td>
                                                        <div style={{ maxWidth: '200px' }}>
                                                            {order.items && order.items.length > 0 ? (
                                                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                                        <li key={idx} style={{ fontSize: '12px' }}>
                                                                            {item.title} x{item.quantity}
                                                                        </li>
                                                                    ))}
                                                                    {order.items.length > 3 && (
                                                                        <li style={{ fontSize: '12px', color: '#666' }}>
                                                                            +{order.items.length - 3} ürün daha
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            ) : (
                                                                <span className="text-muted">Ürün yok</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>{formatPrice(order.total)}</strong>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-control form-control-sm"
                                                            value={order.status || 'processing'}
                                                            onChange={(e) => updateOrderStatus(order.userId, order.orderId, e.target.value)}
                                                            style={{
                                                                minWidth: '140px',
                                                                background: order.status === 'delivered' ? '#d4edda' :
                                                                           order.status === 'in-transit' ? '#cfe2ff' :
                                                                           order.status === 'cancelled' ? '#f8d7da' :
                                                                           order.status === 'returned' ? '#f8d7da' :
                                                                           order.status === 'refunded' ? '#f8d7da' :
                                                                           '#fff3cd'
                                                            }}
                                                        >
                                                            <option value="processing">İşleniyor</option>
                                                            <option value="in-transit">Yolda</option>
                                                            <option value="delivered">Teslim Edildi</option>
                                                            <option value="cancelled">İptal Edildi</option>
                                                            <option value="returned">İade Edildi</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        {order.deliveryAddress ? (
                                                            <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                                                                <strong>{order.deliveryAddress.name}</strong><br />
                                                                {order.deliveryAddress.address}<br />
                                                                {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Adres yok</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-info"
                                                            onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Sipariş Detayları',
                                                                    html: `
                                                                        <div style="text-align: left;">
                                                                            <p><strong>Sipariş ID:</strong> ${order.orderId || 'N/A'}</p>
                                                                            <p><strong>Fatura No:</strong> ${order.invoiceNumber || 'N/A'}</p>
                                                                            <p><strong>Müşteri:</strong> ${order.userName || 'İsimsiz'}</p>
                                                                            <p><strong>Email:</strong> ${order.userEmail || 'Email yok'}</p>
                                                                            <p><strong>Tarih:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
                                                                            <p><strong>Ara Toplam:</strong> ${formatPrice(order.subtotal)}</p>
                                                                            <p><strong>Kargo:</strong> ${formatPrice(order.shipping || 0)}</p>
                                                                            <p><strong>Vergi:</strong> ${formatPrice(order.tax || 0)}</p>
                                                                            <p><strong>Toplam:</strong> ${formatPrice(order.total)}</p>
                                                                            <p><strong>Durum:</strong> ${order.status === 'processing' ? 'İşleniyor' : order.status === 'in-transit' ? 'Yolda' : order.status === 'delivered' ? 'Teslim Edildi' : order.status === 'cancelled' ? 'İptal Edildi' : order.status === 'returned' ? 'İade Edildi' : order.status === 'refunded' ? 'İade Edildi' : order.status || 'İşleniyor'}</p>
                                                                            <p><strong>Ödeme Durumu:</strong> ${order.paymentStatus || 'N/A'}</p>
                                                                            <p><strong>Ödeme Yöntemi:</strong> ${order.paymentMethod || 'N/A'}</p>
                                                                            ${order.comment ? `<p><strong>Yorum/Not:</strong> ${order.comment}</p>` : ''}
                                                                            ${order.estimatedDelivery ? `<p><strong>Tahmini Teslimat:</strong> ${formatDate(order.estimatedDelivery)}</p>` : ''}
                                                                            ${order.deliveryAddress ? `
                                                                                <p><strong>Teslimat Adresi:</strong></p>
                                                                                <p style="margin-left: 20px;">
                                                                                    ${order.deliveryAddress.fullName || order.deliveryAddress.name || ''}<br/>
                                                                                    ${order.deliveryAddress.address || ''}<br/>
                                                                                    ${order.deliveryAddress.city || ''} ${order.deliveryAddress.zipCode || ''}<br/>
                                                                                    ${order.deliveryAddress.phone || ''}
                                                                                </p>
                                                                            ` : ''}
                                                                        </div>
                                                                    `,
                                                                    width: '600px',
                                                                    confirmButtonText: 'Kapat'
                                                                });
                                                            }}
                                                        >
                                                            Detay
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                                </>
                            )}

                            {/* Comments Tab Content */}
                            {activeTab === 'comments' && (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered">
                                            <thead className="thead-dark">
                                                <tr>
                                                    <th>Ürün ID</th>
                                                    <th>Müşteri</th>
                                                    <th>Email</th>
                                                    <th>Sipariş ID</th>
                                                    <th>Yorum</th>
                                                    <th>Tarih</th>
                                                    <th>İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingComments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center">
                                                            <p className="mb-0">Bekleyen yorum bulunmuyor.</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pendingComments.map((comment, index) => (
                                                        <tr key={comment.id || index}>
                                                            <td>
                                                                <strong>{comment.productId || 'N/A'}</strong>
                                                            </td>
                                                            <td>{comment.userName || 'İsimsiz'}</td>
                                                            <td>{comment.userEmail || 'Email yok'}</td>
                                                            <td>
                                                                <small>{comment.orderId || 'N/A'}</small>
                                                            </td>
                                                            <td>
                                                                <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                                                                    {comment.comment}
                                                                </div>
                                                            </td>
                                                            <td>{formatDate(comment.createdAt)}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => approveComment(comment, comment.userId)}
                                                                    style={{ marginRight: '5px' }}
                                                                >
                                                                    ✓ Onayla
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => rejectComment(comment, comment.userId)}
                                                                >
                                                                    ✗ Reddet
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdminPanel;

