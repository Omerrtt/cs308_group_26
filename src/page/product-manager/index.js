import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth, db } from '../../firebaseConfig';
import Header from '../../component/Common/Header';
import Footer from '../../component/Common/Footer';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';
import { getCategoryTree } from '../../app/data/productsData';

// Product Manager Email
const PRODUCT_MANAGER_EMAIL = 'mbozyel2003@gmail.com';

const ProductManagerPanel = () => {
    const history = useHistory();
    const status = useSelector((state) => state.user.status);
    const [loading, setLoading] = useState(true);
    const [isProductManager, setIsProductManager] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'stock', 'delivery', 'orders', 'comments'
    
    // Products Management
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    const [productLoading, setProductLoading] = useState(false);
    
    // Add Product Form
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        image: ''
    });
    
    // Categories Management
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
    
    // Stock Management
    const [stockUpdates, setStockUpdates] = useState({});
    
    // Delivery List
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryLoading, setDeliveryLoading] = useState(false);
    
    // Orders Management
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    
    // Comments Management
    const [pendingComments, setPendingComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
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
            
            if (currentUser.email !== PRODUCT_MANAGER_EMAIL) {
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya sadece product manager erişebilir.',
                    icon: 'error',
                    confirmButtonText: 'Ana Sayfaya Dön'
                }).then(() => {
                    history.push('/');
                });
                setLoading(false);
                return;
            }

            setIsProductManager(true);
            await loadProducts();
            await loadCategories();
            await loadDeliveries();
            await loadOrders();
            await loadPendingComments();
            setLoading(false);
        });

        return () => unsubscribe();
    }, [history]);

    // Ürünleri yükle
    const loadProducts = async () => {
        try {
            const productsSnapshot = await db.collection('products').get();
            const productsList = [];
            productsSnapshot.forEach((doc) => {
                productsList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setProducts(productsList);
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
        }
    };

    // Kategorileri yükle
    const loadCategories = async () => {
        try {
            // Kategori ağacını yükle
            const categoryTree = getCategoryTree();
            const categoriesList = [];
            
            for (const [mainCat, data] of Object.entries(categoryTree)) {
                categoriesList.push({
                    name: mainCat,
                    slug: data.slug,
                    type: 'main'
                });
                
                if (data.subcategories) {
                    for (const [subCat, subData] of Object.entries(data.subcategories)) {
                        categoriesList.push({
                            name: subCat,
                            slug: subData.slug,
                            parent: mainCat,
                            type: 'sub'
                        });
                    }
                }
            }
            
            setCategories(categoriesList);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    // Ürün ekle
    const handleAddProduct = async () => {
        if (!newProduct.title || !newProduct.price || !newProduct.stock) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen tüm zorunlu alanları doldurun.',
                icon: 'warning'
            });
            return;
        }

        setProductLoading(true);
        try {
            const productData = {
                title: newProduct.title,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                category: newProduct.category || '',
                description: newProduct.description || '',
                image: newProduct.image || '',
                rating: 0,
                ratingCount: 0,
                approvedComments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('products').add(productData);

            Swal.fire({
                title: 'Başarılı',
                text: 'Ürün eklendi.',
                icon: 'success'
            });

            setNewProduct({
                title: '',
                price: '',
                stock: '',
                category: '',
                description: '',
                image: ''
            });
            setShowAddProductForm(false);
            await loadProducts();
        } catch (error) {
            console.error('Ürün eklenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Ürün eklenirken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setProductLoading(false);
        }
    };

    // Ürün sil
    const handleDeleteProduct = async (productId) => {
        const result = await Swal.fire({
            title: 'Ürünü Sil',
            text: 'Bu ürünü silmek istediğinize emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal'
        });

        if (!result.isConfirmed) return;

        try {
            await db.collection('products').doc(productId).delete();
            Swal.fire({
                title: 'Başarılı',
                text: 'Ürün silindi.',
                icon: 'success'
            });
            await loadProducts();
        } catch (error) {
            console.error('Ürün silinirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Ürün silinirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Stok güncelle
    const handleUpdateStock = async (productId, newStock) => {
        try {
            await db.collection('products').doc(productId).update({
                stock: parseInt(newStock),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            Swal.fire({
                title: 'Başarılı',
                text: 'Stok güncellendi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await loadProducts();
        } catch (error) {
            console.error('Stok güncellenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Stok güncellenirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Delivery list yükle
    const loadDeliveries = async () => {
        setDeliveryLoading(true);
        try {
            const ordersSnapshot = await db.collection('orders').get();
            const deliveriesList = [];

            ordersSnapshot.forEach((doc) => {
                const order = doc.data();
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item, index) => {
                        deliveriesList.push({
                            deliveryId: `${order.orderId}_${index}`,
                            orderId: order.orderId,
                            customerId: order.userId,
                            customerName: order.userName || 'Bilinmeyen',
                            productId: item.originalId || item.id || item.productId,
                            productName: item.title || item.name,
                            quantity: item.quantity || 1,
                            totalPrice: parseFloat(item.price || 0) * (item.quantity || 1),
                            deliveryAddress: order.deliveryAddress || order.address || {},
                            deliveryCompleted: order.status === 'delivered',
                            orderStatus: order.status || 'processing',
                            orderDate: order.orderDateString || order.orderDate || order.createdAt
                        });
                    });
                }
            });

            // Tarihe göre sırala (en yeni önce)
            deliveriesList.sort((a, b) => {
                const getTimestamp = (dateInput) => {
                    if (!dateInput) return 0;
                    if (typeof dateInput === 'object' && dateInput.toDate) {
                        return dateInput.toDate().getTime();
                    }
                    if (typeof dateInput === 'number') {
                        return dateInput;
                    }
                    const date = new Date(dateInput);
                    return isNaN(date.getTime()) ? 0 : date.getTime();
                };
                
                const dateA = getTimestamp(a.orderDate);
                const dateB = getTimestamp(b.orderDate);
                return dateB - dateA;
            });

            setDeliveries(deliveriesList);
        } catch (error) {
            console.error('Delivery list yüklenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Delivery list yüklenirken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setDeliveryLoading(false);
        }
    };

    // Siparişleri yükle
    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const ordersSnapshot = await db.collection('orders').get();
            const ordersList = [];

            ordersSnapshot.forEach((doc) => {
                const orderData = doc.data();
                console.log('📦 Sipariş yükleniyor - orderId:', doc.id);
                console.log('   - orderDateString:', orderData.orderDateString);
                console.log('   - orderDate:', orderData.orderDate);
                console.log('   - orderDateTimestamp:', orderData.orderDateTimestamp);
                console.log('   - createdAt:', orderData.createdAt);
                console.log('   - Tüm order data:', orderData);
                
                ordersList.push({
                    orderId: doc.id,
                    ...orderData
                });
            });

            // Tarihe göre sırala (en yeni önce)
            ordersList.sort((a, b) => {
                // Tarih değerini al (Timestamp, number veya Date)
                const getTimestamp = (order) => {
                    if (order.orderDateTimestamp) return order.orderDateTimestamp;
                    if (order.orderDate && typeof order.orderDate === 'object' && order.orderDate.toDate) {
                        return order.orderDate.toDate().getTime();
                    }
                    if (order.orderDate && typeof order.orderDate === 'number') {
                        return order.orderDate;
                    }
                    if (order.orderDate) {
                        return new Date(order.orderDate).getTime();
                    }
                    if (order.createdAt && typeof order.createdAt === 'object' && order.createdAt.toDate) {
                        return order.createdAt.toDate().getTime();
                    }
                    if (order.createdAt) {
                        return new Date(order.createdAt).getTime();
                    }
                    return 0;
                };
                
                const dateA = getTimestamp(a);
                const dateB = getTimestamp(b);
                return dateB - dateA;
            });

            setOrders(ordersList);
        } catch (error) {
            console.error('Siparişler yüklenirken hata:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Sipariş durumu güncelle
    const handleUpdateOrderStatus = async (orderId, userId, newStatus) => {
        try {
            const updateTime = new Date();
            const updateData = {
                status: newStatus,
                updatedAt: updateTime.toISOString(),
                updatedAtTimestamp: updateTime.getTime()
            };

            // Orders collection'ındaki order'ı güncelle
            const orderRef = db.collection('orders').doc(orderId);
            await orderRef.update(updateData);

            // Users collection'ındaki orders array'ini de güncelle
            try {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const orders = userData.orders || [];
                    
                    const updatedOrders = orders.map(order => 
                        order.orderId === orderId
                            ? { ...order, ...updateData }
                            : order
                    );
                    
                    await userRef.update({ orders: updatedOrders });
                }
            } catch (userUpdateError) {
                console.error('Users collection güncelleme hatası:', userUpdateError);
            }

            Swal.fire({
                title: 'Başarılı',
                text: 'Sipariş durumu güncellendi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await loadOrders();
            await loadDeliveries();
        } catch (error) {
            console.error('Sipariş durumu güncellenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Sipariş durumu güncellenirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Bekleyen comment'leri yükle
    const loadPendingComments = async () => {
        setCommentsLoading(true);
        try {
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
        } catch (error) {
            console.error('Bekleyen yorumlar yüklenirken hata:', error);
        } finally {
            setCommentsLoading(false);
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
                userName: comment.userName || 'Anonim',
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

            setPendingComments(prev => prev.filter(c => c.id !== comment.id));

            Swal.fire({
                title: 'Başarılı',
                text: 'Yorum onaylandı.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Yorum onaylama hatası:', error);
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

            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};
            const notApprovedComments = userData.notApprovedComments || [];
            const filteredComments = notApprovedComments.filter(c => c.id !== comment.id);
            
            await userRef.update({
                notApprovedComments: filteredComments
            });

            setPendingComments(prev => prev.filter(c => c.id !== comment.id));

            Swal.fire({
                title: 'Başarılı',
                text: 'Yorum silindi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Yorum silme hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Yorum silinirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Format date
    const formatDate = (dateInput) => {
        console.log('🔍 formatDate çağrıldı - dateInput:', dateInput, 'type:', typeof dateInput);
        
        if (!dateInput) {
            console.log('⚠️ dateInput boş');
            return 'Tarih yok';
        }
        
        // Eğer zaten formatlanmış Türkçe string ise (ay isimleri içeriyorsa), direkt döndür
        if (typeof dateInput === 'string') {
            const turkishMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const containsTurkishMonth = turkishMonths.some(month => dateInput.includes(month));
            
            if (containsTurkishMonth) {
                console.log('✅ Zaten formatlanmış Türkçe string, direkt döndürülüyor:', dateInput);
                return dateInput;
            }
        }
        
        try {
            let date;
            
            // Firebase Timestamp kontrolü
            if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
                console.log('✅ Firebase Timestamp bulundu');
                date = dateInput.toDate();
            }
            // Timestamp (number) kontrolü
            else if (typeof dateInput === 'number') {
                console.log('✅ Number timestamp bulundu:', dateInput);
                date = new Date(dateInput);
            }
            // String veya diğer formatlar
            else {
                console.log('✅ String/other format, new Date() ile parse ediliyor:', dateInput);
                date = new Date(dateInput);
            }
            
            console.log('📅 Parse edilen date:', date);
            
            // Geçerli tarih kontrolü
            if (isNaN(date.getTime())) {
                console.error('❌ Geçersiz tarih - getTime() NaN:', date);
                return 'Geçersiz tarih';
            }
            
            const formatted = date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            console.log('✅ Formatlanmış tarih:', formatted);
            return formatted;
        } catch (error) {
            console.error('❌ Tarih formatlama hatası:', error, 'dateInput:', dateInput);
            return 'Tarih yok';
        }
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price || 0);
    };

    // Pagination hesaplamaları
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Sayfa değiştirme
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <>
                <Header />
                <section className="ptb-100">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Yükleniyor...</span>
                            </div>
                            <p className="mt-3">Yükleniyor...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (!isProductManager) {
        return null;
    }

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="mb-4">Product Manager Panel</h1>
                            
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('products');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Ürünler
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('categories');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Kategoriler
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('stock');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Stok Yönetimi
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('delivery');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Teslimat Listesi
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('orders');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Siparişler
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('comments');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Yorumlar
                                    </button>
                                </li>
                            </ul>

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Ürün Yönetimi</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setShowAddProductForm(!showAddProductForm)}
                                            >
                                                {showAddProductForm ? 'Formu Kapat' : '+ Yeni Ürün Ekle'}
                                            </button>
                                        </div>

                                        {showAddProductForm && (
                                            <div className="card mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="card-body">
                                                    <h5 className="mb-3">Yeni Ürün Ekle</h5>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Ürün Adı *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={newProduct.title}
                                                                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Fiyat (₺) *</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={newProduct.price}
                                                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Stok *</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={newProduct.stock}
                                                                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Kategori</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={newProduct.category}
                                                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Görsel URL</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={newProduct.image}
                                                                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <label className="form-label">Açıklama</label>
                                                            <textarea
                                                                className="form-control"
                                                                rows="3"
                                                                value={newProduct.description}
                                                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <button
                                                                className="btn btn-success"
                                                                onClick={handleAddProduct}
                                                                disabled={productLoading}
                                                            >
                                                                {productLoading ? 'Ekleniyor...' : 'Ürün Ekle'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="table-responsive">
                                            <table className="table table-striped" style={{ marginBottom: '0' }}>
                                                <thead>
                                                    <tr style={{ lineHeight: '1.2' }}>
                                                        <th style={{ padding: '8px' }}>Ürün Adı</th>
                                                        <th style={{ padding: '8px' }}>Fiyat</th>
                                                        <th style={{ padding: '8px' }}>Stok</th>
                                                        <th style={{ padding: '8px' }}>Kategori</th>
                                                        <th style={{ padding: '8px' }}>İşlemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedProducts.map((product) => (
                                                        <tr key={product.id} style={{ lineHeight: '1.2' }}>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{product.title || product.name}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{formatPrice(product.price)}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{product.stock || 0}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{product.category || '-'}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteProduct(product.id)}
                                                                >
                                                                    <i className="fa fa-trash"></i> Sil
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center mt-4">
                                                <div>
                                                    <p className="mb-0 text-muted">
                                                        Toplam {products.length} ürün - Sayfa {currentPage} / {totalPages}
                                                        <br />
                                                        <small>Gösterilen: {startIndex + 1} - {Math.min(endIndex, products.length)}</small>
                                                    </p>
                                                </div>
                                                <nav>
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-left"></i>
                                                            </button>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, index) => {
                                                            const page = index + 1;
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                                            ) {
                                                                return (
                                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(page)}
                                                                            style={{ padding: '6px 12px' }}
                                                                        >
                                                                            {page}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            } else if (
                                                                page === currentPage - 3 ||
                                                                page === currentPage + 3
                                                            ) {
                                                                return (
                                                                    <li key={page} className="page-item disabled">
                                                                        <span className="page-link" style={{ padding: '6px 12px' }}>...</span>
                                                                    </li>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Categories Tab */}
                            {activeTab === 'categories' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Kategori Yönetimi</h3>
                                        <div className="alert alert-info">
                                            <p className="mb-0">Kategori yönetimi şu anda categoryTree.json dosyasından yükleniyor. İleride buradan kategori ekleme/çıkarma özelliği eklenecek.</p>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Kategori Adı</th>
                                                        <th>Slug</th>
                                                        <th>Tip</th>
                                                        <th>Ana Kategori</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories.map((category, index) => (
                                                        <tr key={index}>
                                                            <td>{category.name}</td>
                                                            <td>{category.slug}</td>
                                                            <td>
                                                                <span className={`badge ${category.type === 'main' ? 'bg-primary' : 'bg-secondary'}`}>
                                                                    {category.type === 'main' ? 'Ana' : 'Alt'}
                                                                </span>
                                                            </td>
                                                            <td>{category.parent || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stock Management Tab */}
                            {activeTab === 'stock' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Stok Yönetimi</h3>
                                        <div className="table-responsive">
                                            <table className="table table-striped" style={{ marginBottom: '0' }}>
                                                <thead>
                                                    <tr style={{ lineHeight: '1.2' }}>
                                                        <th style={{ padding: '8px' }}>Ürün Adı</th>
                                                        <th style={{ padding: '8px' }}>Mevcut Stok</th>
                                                        <th style={{ padding: '8px' }}>Yeni Stok</th>
                                                        <th style={{ padding: '8px' }}>İşlemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedProducts.map((product) => (
                                                        <tr key={product.id} style={{ lineHeight: '1.2' }}>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{product.title || product.name}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <span className={`badge ${(product.stock || 0) > 10 ? 'bg-success' : (product.stock || 0) > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                                                    {product.stock || 0}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    defaultValue={product.stock || 0}
                                                                    onBlur={(e) => handleUpdateStock(product.id, e.target.value)}
                                                                    style={{ width: '100px', padding: '4px 8px', fontSize: '13px' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <span className="badge bg-info">Otomatik güncelleniyor</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center mt-4">
                                                <div>
                                                    <p className="mb-0 text-muted">
                                                        Toplam {products.length} ürün - Sayfa {currentPage} / {totalPages}
                                                    </p>
                                                </div>
                                                <nav>
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-left"></i>
                                                            </button>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, index) => {
                                                            const page = index + 1;
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                                            ) {
                                                                return (
                                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(page)}
                                                                            style={{ padding: '6px 12px' }}
                                                                        >
                                                                            {page}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            } else if (
                                                                page === currentPage - 3 ||
                                                                page === currentPage + 3
                                                            ) {
                                                                return (
                                                                    <li key={page} className="page-item disabled">
                                                                        <span className="page-link" style={{ padding: '6px 12px' }}>...</span>
                                                                    </li>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Delivery List Tab */}
                            {activeTab === 'delivery' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Teslimat Listesi</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={loadDeliveries}
                                                disabled={deliveryLoading}
                                            >
                                                {deliveryLoading ? 'Yükleniyor...' : 'Yenile'}
                                            </button>
                                        </div>

                                        {deliveries.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Delivery ID</th>
                                                            <th>Sipariş No</th>
                                                            <th>Müşteri</th>
                                                            <th>Ürün</th>
                                                            <th>Miktar</th>
                                                            <th>Toplam Fiyat</th>
                                                            <th>Teslimat Adresi</th>
                                                            <th>Durum</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {deliveries.map((delivery, index) => (
                                                            <tr key={index}>
                                                                <td>{delivery.deliveryId}</td>
                                                                <td>{delivery.orderId}</td>
                                                                <td>{delivery.customerName}</td>
                                                                <td>{delivery.productName}</td>
                                                                <td>{delivery.quantity}</td>
                                                                <td>{formatPrice(delivery.totalPrice)}</td>
                                                                <td>
                                                                    {delivery.deliveryAddress.fullName && (
                                                                        <div>
                                                                            <strong>{delivery.deliveryAddress.fullName}</strong><br />
                                                                            {delivery.deliveryAddress.address}<br />
                                                                            {delivery.deliveryAddress.city} {delivery.deliveryAddress.zipCode}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${delivery.deliveryCompleted ? 'bg-success' : 'bg-warning'}`}>
                                                                        {delivery.deliveryCompleted ? 'Teslim Edildi' : delivery.orderStatus}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">Teslimat bulunamadı.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Sipariş Yönetimi</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={loadOrders}
                                                disabled={ordersLoading}
                                            >
                                                {ordersLoading ? 'Yükleniyor...' : 'Yenile'}
                                            </button>
                                        </div>

                                        {orders.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Sipariş No</th>
                                                            <th>Müşteri</th>
                                                            <th>Tarih</th>
                                                            <th>Tutar</th>
                                                            <th>Durum</th>
                                                            <th>İşlemler</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.map((order) => (
                                                            <tr key={order.orderId}>
                                                                <td>{order.orderId}</td>
                                                                <td>{order.userName || 'Bilinmeyen'}</td>
                                                                <td>
                                                                    {(() => {
                                                                        // Öncelik sırası: orderDateTimestamp > orderDate > orderDateString > createdAt
                                                                        // orderDateString zaten formatlanmış, diğerleri parse edilmeli
                                                                        let dateValue;
                                                                        if (order.orderDateTimestamp) {
                                                                            dateValue = order.orderDateTimestamp;
                                                                        } else if (order.orderDate) {
                                                                            dateValue = order.orderDate;
                                                                        } else if (order.orderDateString) {
                                                                            // Zaten formatlanmış, direkt döndür
                                                                            return order.orderDateString;
                                                                        } else if (order.createdAt) {
                                                                            dateValue = order.createdAt;
                                                                        } else {
                                                                            return 'Tarih yok';
                                                                        }
                                                                        
                                                                        console.log('🎯 Tarih gösterimi - orderId:', order.orderId, 'dateValue:', dateValue);
                                                                        return formatDate(dateValue);
                                                                    })()}
                                                                </td>
                                                                <td>{formatPrice(order.total)}</td>
                                                                <td>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={order.status || 'processing'}
                                                                        onChange={(e) => handleUpdateOrderStatus(order.orderId, order.userId, e.target.value)}
                                                                        style={{ width: '150px' }}
                                                                    >
                                                                        <option value="processing">İşleniyor</option>
                                                                        <option value="in-transit">Yolda</option>
                                                                        <option value="delivered">Teslim Edildi</option>
                                                                        <option value="cancelled">İptal Edildi</option>
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-info">Otomatik güncelleniyor</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">Sipariş bulunamadı.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Yorum Yönetimi</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={loadPendingComments}
                                                disabled={commentsLoading}
                                            >
                                                {commentsLoading ? 'Yükleniyor...' : 'Yenile'}
                                            </button>
                                        </div>

                                        {pendingComments.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Ürün ID</th>
                                                            <th>Kullanıcı</th>
                                                            <th>Yorum</th>
                                                            <th>Tarih</th>
                                                            <th>İşlemler</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingComments.map((comment, index) => (
                                                            <tr key={comment.id || index}>
                                                                <td>{comment.productId}</td>
                                                                <td>{comment.userName}</td>
                                                                <td style={{ maxWidth: '300px' }}>{comment.comment}</td>
                                                                <td>{formatDate(comment.createdAt)}</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-success me-2"
                                                                        onClick={() => approveComment(comment, comment.userId)}
                                                                    >
                                                                        <i className="fa fa-check"></i> Onayla
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => rejectComment(comment, comment.userId)}
                                                                    >
                                                                        <i className="fa fa-times"></i> Reddet
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">Bekleyen yorum bulunamadı.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default ProductManagerPanel;

