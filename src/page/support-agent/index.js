import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth, db } from '../../firebaseConfig';
import Header from '../../component/Common/Header';
import Footer from '../../component/Common/Footer';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';

// Support Agent Email
const SUPPORT_AGENT_EMAIL = 'mbzyl349@gmail.com';

const SupportAgentPanel = () => {
    const history = useHistory();
    const status = useSelector((state) => state.user.status);
    const [loading, setLoading] = useState(true);
    const [isSupportAgent, setIsSupportAgent] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [showFullCustomerInfo, setShowFullCustomerInfo] = useState(false);
    const fileInputRef = React.useRef(null);
    const chatsUnsubscribeRef = React.useRef(null);
    const messagesUnsubscribeRef = React.useRef(null);

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
            
            if (currentUser.email !== SUPPORT_AGENT_EMAIL) {
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya sadece support agent erişebilir.',
                    icon: 'error',
                    confirmButtonText: 'Ana Sayfaya Dön'
                }).then(() => {
                    history.push('/');
                });
                setLoading(false);
                return;
            }

            setIsSupportAgent(true);
            setupChatsListener();
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (chatsUnsubscribeRef.current) {
                chatsUnsubscribeRef.current();
            }
            if (messagesUnsubscribeRef.current) {
                messagesUnsubscribeRef.current();
            }
        };
    }, [history]);

    // Seçili chat değiştiğinde mesajları dinle
    useEffect(() => {
        if (selectedChatId) {
            setupMessagesListener(selectedChatId);
            loadCustomerDetails(selectedChatId);
            setShowFullCustomerInfo(false); // Yeni chat seçildiğinde detayları gizle
        } else {
            if (messagesUnsubscribeRef.current) {
                messagesUnsubscribeRef.current();
            }
            setMessages([]);
            setCustomerInfo(null);
            setShowFullCustomerInfo(false);
        }

        return () => {
            if (messagesUnsubscribeRef.current) {
                messagesUnsubscribeRef.current();
            }
        };
    }, [selectedChatId]);

    // Chats real-time listener
    const setupChatsListener = () => {
        chatsUnsubscribeRef.current = db.collection('liveChats')
            .orderBy('updatedAt', 'desc')
            .onSnapshot((snapshot) => {
                const chatsList = [];
                snapshot.forEach((doc) => {
                    const chatData = doc.data();
                    const messages = chatData.messages || [];
                    const lastMessage = messages[messages.length - 1];
                    const customerMessages = messages.filter(m => !m.isAgent);
                    const hasUnread = customerMessages.length > 0 && 
                                     (!lastMessage || !lastMessage.isAgent) &&
                                     chatData.status === 'open';

                    chatsList.push({
                        id: doc.id,
                        customerId: chatData.customerId,
                        customerName: chatData.customerName || 'Misafir',
                        customerEmail: chatData.customerEmail,
                        status: chatData.status || 'open',
                        claimedBy: chatData.claimedBy,
                        lastMessage: lastMessage?.message || 'Henüz mesaj yok',
                        lastMessageTime: lastMessage?.timestamp || chatData.createdAt,
                        messageCount: messages.length,
                        hasUnread: hasUnread,
                        isClaimed: chatData.status === 'claimed',
                        createdAt: chatData.createdAt,
                        updatedAt: chatData.updatedAt
                    });
                });

                setChats(chatsList);
            }, (error) => {
                console.error('Chats listener hatası:', error);
            });
    };

    // Messages real-time listener
    const setupMessagesListener = (chatId) => {
        if (messagesUnsubscribeRef.current) {
            messagesUnsubscribeRef.current();
        }

        const chatRef = db.collection('liveChats').doc(chatId);
        messagesUnsubscribeRef.current = chatRef.onSnapshot((doc) => {
            if (doc.exists) {
                const chatData = doc.data();
                setMessages(chatData.messages || []);
            }
        }, (error) => {
            console.error('Messages listener hatası:', error);
        });
    };

    // Chat seç
    const handleSelectChat = (chat) => {
        setSelectedChatId(chat.id);
    };

    // Chat claim et
    const handleClaimChat = async () => {
        if (!selectedChatId) return;

        try {
            const chatRef = db.collection('liveChats').doc(selectedChatId);
            const chatDoc = await chatRef.get();
            
            if (chatDoc.exists) {
                const currentMessages = chatDoc.data().messages || [];
                const now = new Date();
                const claimMessage = {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    senderId: auth.currentUser.uid,
                    senderName: 'Support Agent',
                    senderEmail: SUPPORT_AGENT_EMAIL,
                    message: 'Merhaba! Size nasıl yardımcı olabilirim?',
                    attachments: [],
                    timestamp: firebase.firestore.Timestamp.fromDate(now),
                    isAgent: true
                };

                await chatRef.update({
                    status: 'claimed',
                    claimedBy: auth.currentUser.uid,
                    messages: [...currentMessages, claimMessage],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Chat claim hatası:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Chat alınamadı. Lütfen tekrar deneyin.',
                icon: 'error'
            });
        }
    };

    // Mesaj gönder
    const handleSendMessage = async () => {
        if (!selectedChatId) return;
        if (!newMessage.trim() && attachments.length === 0) return;

        try {
            const chatRef = db.collection('liveChats').doc(selectedChatId);
            const chatDoc = await chatRef.get();
            
            if (chatDoc.exists) {
                const currentMessages = chatDoc.data().messages || [];
                const now = new Date();
                const message = {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    senderId: auth.currentUser.uid,
                    senderName: 'Support Agent',
                    senderEmail: SUPPORT_AGENT_EMAIL,
                    message: newMessage.trim(),
                    attachments: attachments,
                    timestamp: firebase.firestore.Timestamp.fromDate(now),
                    isAgent: true
                };

                await chatRef.update({
                    messages: [...currentMessages, message],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                setNewMessage('');
                setAttachments([]);
            }
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
                icon: 'error'
            });
        }
    };

    // Müşteri detaylarını yükle
    const loadCustomerDetails = async (chatId) => {
        try {
            const chatDoc = await db.collection('liveChats').doc(chatId).get();
            if (!chatDoc.exists) {
                setCustomerInfo(null);
                return;
            }

            const chatData = chatDoc.data();
            const customerId = chatData.customerId;

            if (customerId === 'guest') {
                setCustomerInfo({
                    name: chatData.customerName || 'Misafir',
                    email: chatData.customerEmail || '',
                    cartItems: 0,
                    cartTotal: 0,
                    orders: [],
                    totalOrders: 0,
                    wishlist: [],
                    deliveries: []
                });
                return;
            }

            // Chat'ten gelen bilgileri kullan (chat oluşturulurken eklenmiş)
            let customerProfile = chatData.customerProfile || null;
            let customerCart = chatData.customerCart || [];
            let customerOrders = chatData.customerOrders || [];
            let customerWishlist = chatData.customerWishlist || [];

            // Eğer chat'te yoksa, Firebase'den çek
            if (!customerProfile || customerCart.length === 0 || customerOrders.length === 0) {
                try {
                    const userDoc = await db.collection('users').doc(customerId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        if (!customerProfile) {
                            customerProfile = {
                                name: userData.name || chatData.customerName || 'Bilinmeyen',
                                email: chatData.customerEmail || userData.email || '',
                                phone: userData.phone || null,
                                address: userData.address || null
                            };
                        }
                        if (customerCart.length === 0) {
                            customerCart = userData.cart || [];
                        }
                        if (customerWishlist.length === 0) {
                            customerWishlist = userData.wishlist || [];
                        }
                    }
                } catch (userError) {
                    console.warn('User bilgileri çekilemedi:', userError);
                }
            }

            // Orders collection'dan siparişleri çek (daha detaylı bilgi için)
            try {
                const ordersSnapshot = await db.collection('orders')
                    .where('userId', '==', customerId)
                    .orderBy('orderDateTimestamp', 'desc')
                    .limit(10)
                    .get();
                
                const detailedOrders = ordersSnapshot.docs.map(doc => {
                    const orderData = doc.data();
                    return {
                        orderId: orderData.orderId || doc.id,
                        status: orderData.status || 'processing',
                        total: orderData.total || 0,
                        orderDate: orderData.orderDateString || orderData.orderDate || null,
                        items: orderData.items || [],
                        deliveryAddress: orderData.deliveryAddress || null,
                        deliveryStatus: orderData.deliveryStatus || null
                    };
                });
                
                // Chat'ten gelen siparişlerle birleştir
                if (detailedOrders.length > 0) {
                    customerOrders = detailedOrders;
                }
            } catch (ordersError) {
                console.warn('Orders collection\'dan siparişler çekilemedi:', ordersError);
            }

            // Delivery bilgilerini çek
            let deliveries = [];
            try {
                const deliveriesSnapshot = await db.collection('orders')
                    .where('userId', '==', customerId)
                    .get();
                
                deliveries = [];
                deliveriesSnapshot.forEach((doc) => {
                    const order = doc.data();
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach((item, index) => {
                            deliveries.push({
                                deliveryId: `${order.orderId}_${index}`,
                                orderId: order.orderId,
                                productName: item.title || item.name,
                                quantity: item.quantity || 1,
                                status: order.status || 'processing',
                                deliveryAddress: order.deliveryAddress || null,
                                orderDate: order.orderDateString || order.orderDate || null
                            });
                        });
                    }
                });
            } catch (deliveryError) {
                console.warn('Delivery bilgileri çekilemedi:', deliveryError);
            }

            setCustomerInfo({
                name: customerProfile?.name || chatData.customerName || 'Bilinmeyen',
                email: customerProfile?.email || chatData.customerEmail || '',
                phone: customerProfile?.phone || null,
                address: customerProfile?.address || null,
                cartItems: customerCart.length,
                cartTotal: customerCart.reduce((sum, item) => 
                    sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0
                ),
                cart: customerCart,
                orders: customerOrders,
                totalOrders: customerOrders.length,
                wishlist: customerWishlist,
                wishlistCount: customerWishlist.length,
                deliveries: deliveries
            });
        } catch (error) {
            console.error('Müşteri bilgileri yüklenirken hata:', error);
            setCustomerInfo(null);
        }
    };

    // Dosya seç
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                Swal.fire({
                    title: 'Dosya Çok Büyük',
                    text: 'Dosya boyutu 10MB\'dan küçük olmalıdır.',
                    icon: 'warning'
                });
                return false;
            }
            return true;
        });

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const attachment = {
                    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: reader.result
                };
                setAttachments(prev => [...prev, attachment]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Dosya kaldır
    const handleRemoveAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Tarih yok';
        try {
            let date;
            if (dateString.toDate) {
                date = dateString.toDate();
            } else {
                date = new Date(dateString);
            }
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

    if (!isSupportAgent) {
        return null;
    }

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="mb-4">Support Agent Panel</h1>
                            
                            <div className="row">
                                {/* Chats List */}
                                <div className="col-md-4">
                                    <div className="card shadow-sm" style={{ height: '700px' }}>
                                        <div className="card-header bg-primary text-white">
                                            <h5 className="mb-0">Aktif Konuşmalar ({chats.length})</h5>
                                        </div>
                                        <div className="card-body p-0" style={{ overflowY: 'auto', maxHeight: '650px' }}>
                                            {chats.length === 0 ? (
                                                <div className="text-center text-muted p-4">
                                                    <p>Henüz konuşma yok.</p>
                                                </div>
                                            ) : (
                                                chats.map((chat) => (
                                                    <div
                                                        key={chat.id}
                                                        onClick={() => handleSelectChat(chat)}
                                                        style={{
                                                            padding: '15px',
                                                            borderBottom: '1px solid #dee2e6',
                                                            cursor: 'pointer',
                                                            background: selectedChatId === chat.id ? '#f8f9fa' : 'white',
                                                            borderLeft: selectedChatId === chat.id ? '4px solid #007bff' : 'none'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (selectedChatId !== chat.id) {
                                                                e.currentTarget.style.background = '#f8f9fa';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (selectedChatId !== chat.id) {
                                                                e.currentTarget.style.background = 'white';
                                                            }
                                                        }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <strong>{chat.customerName}</strong>
                                                                {chat.hasUnread && (
                                                                    <span className="badge bg-danger ms-2">Yeni</span>
                                                                )}
                                                                {chat.isClaimed && (
                                                                    <span className="badge bg-success ms-2">Alındı</span>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">
                                                                {chat.lastMessageTime && (
                                                                    chat.lastMessageTime.toDate ? (
                                                                        chat.lastMessageTime.toDate().toLocaleTimeString('tr-TR', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    ) : (
                                                                        new Date(chat.lastMessageTime).toLocaleTimeString('tr-TR', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    )
                                                                )}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>
                                                            {chat.lastMessage.length > 50 
                                                                ? chat.lastMessage.substring(0, 50) + '...' 
                                                                : chat.lastMessage}
                                                        </p>
                                                        <small className="text-muted">
                                                            {chat.messageCount} mesaj - {chat.status}
                                                        </small>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="col-md-8">
                                    <div className="card shadow-sm" style={{ height: '700px' }}>
                                        {selectedChatId ? (
                                            <>
                                                <div className="card-header bg-light">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h5 className="mb-0">
                                                                {chats.find(c => c.id === selectedChatId)?.customerName || 'Müşteri'}
                                                            </h5>
                                                            <small className="text-muted">
                                                                {chats.find(c => c.id === selectedChatId)?.customerEmail || 'Email yok'}
                                                            </small>
                                                        </div>
                                                        {chats.find(c => c.id === selectedChatId)?.status === 'open' && (
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={handleClaimChat}
                                                            >
                                                                <i className="fa fa-hand-paper"></i> Konuşmayı Al
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                {customerInfo && (
                                                    <div className="card-body p-3" style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <h6 className="mb-0"><i className="fa fa-user me-2"></i>Müşteri Bilgileri</h6>
                                                            <button
                                                                className="btn btn-sm btn-link p-0"
                                                                onClick={() => setShowFullCustomerInfo(!showFullCustomerInfo)}
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                {showFullCustomerInfo ? (
                                                                    <>
                                                                        <i className="fa fa-chevron-up me-1"></i>Daha Az Göster
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa fa-chevron-down me-1"></i>Daha Fazla Göster
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Özet Bilgiler (Her Zaman Görünür) */}
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <strong>İsim:</strong> {customerInfo.name}<br />
                                                                <strong>Email:</strong> {customerInfo.email || 'Email yok'}<br />
                                                                {customerInfo.phone && (
                                                                    <><strong>Telefon:</strong> {customerInfo.phone}<br /></>
                                                                )}
                                                            </div>
                                                            <div className="col-md-6">
                                                                <strong>Sepet:</strong> {customerInfo.cartItems} ürün - {formatPrice(customerInfo.cartTotal)}<br />
                                                                <strong>Wishlist:</strong> {customerInfo.wishlistCount || 0} ürün<br />
                                                                <strong>Toplam Sipariş:</strong> {customerInfo.totalOrders} sipariş
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Detaylı Bilgiler (Sadece Genişletilmiş Durumda) */}
                                                        {showFullCustomerInfo && (
                                                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                                                                {/* Sepet Detayları */}
                                                                {customerInfo.cart && customerInfo.cart.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <strong>Sepet İçeriği:</strong>
                                                                        <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                                                                            {customerInfo.cart.map((item, index) => (
                                                                                <li key={index}>
                                                                                    {item.title || item.name} - {item.quantity}x - {formatPrice(item.price * (item.quantity || 1))}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Wishlist */}
                                                                {customerInfo.wishlist && customerInfo.wishlist.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <strong>İstek Listesi:</strong>
                                                                        <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                                                                            {customerInfo.wishlist.slice(0, 5).map((item, index) => (
                                                                                <li key={index}>
                                                                                    {item.title || item.name} - {formatPrice(item.price)}
                                                                                </li>
                                                                            ))}
                                                                            {customerInfo.wishlist.length > 5 && (
                                                                                <li className="text-muted">... ve {customerInfo.wishlist.length - 5} ürün daha</li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Siparişler */}
                                                                {customerInfo.orders && customerInfo.orders.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <strong>Son Siparişler:</strong>
                                                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                                            {customerInfo.orders.map((order, index) => (
                                                                                <div key={index} className="mb-2 p-2" style={{ background: 'white', borderRadius: '4px', fontSize: '12px' }}>
                                                                                    <div className="d-flex justify-content-between">
                                                                                        <span><strong>Sipariş No:</strong> {order.orderId}</span>
                                                                                        <span className={`badge ${order.status === 'delivered' ? 'bg-success' : order.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                                                                                            {order.status || 'processing'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div><strong>Tutar:</strong> {formatPrice(order.total)}</div>
                                                                                    {order.orderDate && (
                                                                                        <div><strong>Tarih:</strong> {typeof order.orderDate === 'string' ? order.orderDate : formatDate(order.orderDate)}</div>
                                                                                    )}
                                                                                    {order.deliveryAddress && (
                                                                                        <div className="text-muted" style={{ fontSize: '11px' }}>
                                                                                            <strong>Teslimat:</strong> {order.deliveryAddress.city || ''} {order.deliveryAddress.zipCode || ''}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Teslimat Durumu */}
                                                                {customerInfo.deliveries && customerInfo.deliveries.length > 0 && (
                                                                    <div>
                                                                        <strong>Teslimat Durumu:</strong>
                                                                        <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '12px' }}>
                                                                            {customerInfo.deliveries.slice(0, 5).map((delivery, index) => (
                                                                                <div key={index} className="mb-1">
                                                                                    {delivery.productName} - {delivery.quantity}x - 
                                                                                    <span className={`badge ms-2 ${delivery.status === 'delivered' ? 'bg-success' : delivery.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                                                                                        {delivery.status || 'processing'}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                            {customerInfo.deliveries.length > 5 && (
                                                                                <div className="text-muted">... ve {customerInfo.deliveries.length - 5} teslimat daha</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Messages */}
                                                <div className="card-body p-3" style={{ overflowY: 'auto', height: '450px', background: '#f5f5f5' }}>
                                                    {messages.map((msg) => (
                                                        <div
                                                            key={msg.id}
                                                            style={{
                                                                marginBottom: '15px',
                                                                display: 'flex',
                                                                justifyContent: msg.isAgent ? 'flex-end' : 'flex-start'
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    maxWidth: '70%',
                                                                    background: msg.isAgent ? '#007bff' : '#e9ecef',
                                                                    color: msg.isAgent ? 'white' : '#333',
                                                                    padding: '10px 15px',
                                                                    borderRadius: '18px',
                                                                    wordWrap: 'break-word'
                                                                }}
                                                            >
                                                                {!msg.isAgent && (
                                                                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px' }}>
                                                                        {msg.senderName}
                                                                    </div>
                                                                )}
                                                                <div>{msg.message}</div>
                                                                {msg.attachments && msg.attachments.length > 0 && (
                                                                    <div style={{ marginTop: '10px' }}>
                                                                        {msg.attachments.map((att) => (
                                                                            <div key={att.id} style={{ marginTop: '5px' }}>
                                                                                {att.type.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={att.data}
                                                                                        alt={att.name}
                                                                                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                                                                                    />
                                                                                ) : (
                                                                                    <a
                                                                                        href={att.data}
                                                                                        download={att.name}
                                                                                        style={{
                                                                                            color: msg.isAgent ? 'white' : '#007bff',
                                                                                            textDecoration: 'underline',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '5px'
                                                                                        }}
                                                                                    >
                                                                                        <i className="fa fa-paperclip"></i>
                                                                                        {att.name}
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px' }}>
                                                                    {msg.timestamp && msg.timestamp.toDate ? (
                                                                        msg.timestamp.toDate().toLocaleTimeString('tr-TR', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    ) : (
                                                                        new Date().toLocaleTimeString('tr-TR', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Attachments Preview */}
                                                {attachments.length > 0 && (
                                                    <div className="card-body p-2" style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                                                        {attachments.map((att) => (
                                                            <div
                                                                key={att.id}
                                                                className="d-flex align-items-center gap-2 mb-1"
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                <i className="fa fa-paperclip"></i>
                                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {att.name}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemoveAttachment(att.id)}
                                                                    className="btn btn-sm btn-link text-danger p-0"
                                                                >
                                                                    <i className="fa fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Input Area */}
                                                <div className="card-footer">
                                                    <div className="d-flex gap-2 mb-2">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            multiple
                                                            accept="image/*,video/*,.pdf"
                                                            onChange={handleFileSelect}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="btn btn-sm btn-outline-secondary"
                                                        >
                                                            <i className="fa fa-paperclip"></i>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Mesajınızı yazın..."
                                                            value={newMessage}
                                                            onChange={(e) => setNewMessage(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSendMessage();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={handleSendMessage}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            <i className="fa fa-paper-plane"></i>
                                                        </button>
                                                    </div>
                                                    <small className="text-muted">
                                                        PDF, resim ve video gönderebilirsiniz (max 10MB)
                                                    </small>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="card-body d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                                                <div className="text-center text-muted">
                                                    <i className="fa fa-comments" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                                                    <p>Bir konuşma seçin</p>
                                                </div>
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
    );
};

export default SupportAgentPanel;
