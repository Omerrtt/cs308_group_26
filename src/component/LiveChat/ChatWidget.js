import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { auth, db } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';

const ChatWidget = () => {
    const userStatus = useSelector((state) => state.user.status);
    const user = useSelector((state) => state.user.user);
    const carts = useSelector((state) => state.products.carts);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const [isAgent, setIsAgent] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const unsubscribeRef = useRef(null);

    // Chat ID oluştur veya yükle
    useEffect(() => {
        const currentUser = auth.currentUser;
        
        // Support agent kontrolü
        if (currentUser && currentUser.email === 'mbzyl349@gmail.com') {
            setIsAgent(true);
            return; // Agent widget'ı kullanmaz
        }

        // Chat ID oluştur veya yükle
        const initializeChat = async () => {
            const storedChatId = localStorage.getItem('chat_id');
            
            if (storedChatId) {
                // Mevcut chat'i kontrol et
                const chatDoc = await db.collection('liveChats').doc(storedChatId).get();
                if (chatDoc.exists) {
                    setChatId(storedChatId);
                    setupRealtimeListener(storedChatId);
                } else {
                    // Chat silinmiş, yeni oluştur
                    createNewChat();
                }
            } else {
                // Yeni chat oluştur
                createNewChat();
            }
        };

        const createNewChat = async () => {
            try {
                const currentUser = auth.currentUser;
                
                // User bilgisini Firebase'den al (Redux'tan gelmeyebilir)
                let customerName = 'Misafir';
                let customerEmail = null;
                
                if (currentUser) {
                    customerEmail = currentUser.email;
                    // Önce Redux'tan dene
                    if (user?.name) {
                        customerName = user.name;
                    } else {
                        // Firebase'den user bilgisini çek
                        try {
                            const userDoc = await db.collection('users').doc(currentUser.uid).get();
                            if (userDoc.exists) {
                                const userData = userDoc.data();
                                customerName = userData.name || currentUser.displayName || 'Kullanıcı';
                            } else {
                                customerName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı';
                            }
                        } catch (err) {
                            customerName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı';
                        }
                    }
                }
                
                const chatData = {
                    customerId: currentUser ? currentUser.uid : 'guest',
                    customerName: customerName,
                    customerEmail: customerEmail,
                    status: 'open', // open, claimed, closed
                    claimedBy: null,
                    messages: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                const docRef = await db.collection('liveChats').add(chatData);
                setChatId(docRef.id);
                localStorage.setItem('chat_id', docRef.id);
                setupRealtimeListener(docRef.id);
            } catch (error) {
                console.error('Chat oluşturulurken hata:', error);
                Swal.fire({
                    title: 'Hata',
                    text: 'Chat başlatılamadı. Lütfen tekrar deneyin.',
                    icon: 'error'
                });
            }
        };

        initializeChat();

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // Real-time listener kur
    const setupRealtimeListener = (chatId) => {
        if (!chatId) return;

        const chatRef = db.collection('liveChats').doc(chatId);
        
        unsubscribeRef.current = chatRef.onSnapshot((doc) => {
            if (doc.exists) {
                const chatData = doc.data();
                setMessages(chatData.messages || []);
            }
        }, (error) => {
            console.error('Chat listener hatası:', error);
        });
    };

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mesaj gönder
    const handleSendMessage = async () => {
        if (!newMessage.trim() && attachments.length === 0) return;
        if (!chatId) return;

        try {
            const currentUser = auth.currentUser;
            const now = new Date();
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                senderId: currentUser ? currentUser.uid : 'guest',
                senderName: currentUser ? (user?.name || 'Kullanıcı') : 'Misafir',
                senderEmail: currentUser ? currentUser.email : null,
                message: newMessage.trim(),
                attachments: attachments,
                timestamp: firebase.firestore.Timestamp.fromDate(now),
                isAgent: false
            };

            const chatRef = db.collection('liveChats').doc(chatId);
            const chatDoc = await chatRef.get();
            
            if (chatDoc.exists) {
                const currentMessages = chatDoc.data().messages || [];
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
                    data: reader.result // Base64
                };
                setAttachments(prev => [...prev, attachment]);
            };
            reader.readAsDataURL(file);
        });

        // Input'u temizle
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Dosya kaldır
    const handleRemoveAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    // Müşteri bilgilerini al (agent için)
    const getCustomerInfo = () => {
        if (!userStatus || !user) return null;

        return {
            name: user.name,
            email: user.email,
            cartItems: carts.length,
            cartTotal: carts.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
        };
    };

    const customerInfo = getCustomerInfo();

    return (
        <>
            {/* Chat Widget Button */}
            {!isOpen && !isAgent && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#25D366',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <i className="fa fa-comments"></i>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && !isAgent && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '400px',
                        height: '600px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        zIndex: 1001,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {/* Chat Header */}
                    <div
                        style={{
                            background: '#25D366',
                            color: 'white',
                            padding: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <h5 className="mb-0" style={{ margin: 0 }}>
                                <i className="fa fa-headphones me-2"></i>
                                Canlı Destek
                            </h5>
                            <small style={{ opacity: 0.9 }}>
                                {userStatus ? 'Giriş yapılmış' : 'Misafir'}
                            </small>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '0',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '15px',
                            background: '#f5f5f5'
                        }}
                    >
                        {!messages || messages.length === 0 ? (
                            <div className="text-center text-muted mt-4">
                                <p>Henüz mesaj yok. Mesajınızı yazın...</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                if (!msg || !msg.id) {
                                    // Geçersiz mesaj, skip et
                                    return null;
                                }
                                
                                return (
                                    <div
                                        key={msg.id || `msg_${index}`}
                                        style={{
                                            marginBottom: '15px',
                                            display: 'flex',
                                            justifyContent: msg.isAgent ? 'flex-start' : 'flex-end'
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '75%',
                                                background: msg.isAgent ? '#e9ecef' : '#25D366',
                                                color: msg.isAgent ? '#333' : 'white',
                                                padding: '10px 15px',
                                                borderRadius: '18px',
                                                wordWrap: 'break-word'
                                            }}
                                        >
                                            {!msg.isAgent && msg.senderName && (
                                                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px' }}>
                                                    {msg.senderName}
                                                </div>
                                            )}
                                            {msg.isAgent && (
                                                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px' }}>
                                                    Support Agent
                                                </div>
                                            )}
                                            <div>{msg.message || ''}</div>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div style={{ marginTop: '10px' }}>
                                                    {msg.attachments.map((att) => (
                                                        <div key={att.id || `att_${index}`} style={{ marginTop: '5px' }}>
                                                            {att.type && att.type.startsWith('image/') ? (
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
                                                                        color: msg.isAgent ? '#007bff' : 'white',
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
                                                {msg.timestamp ? (
                                                    msg.timestamp.toDate ? (
                                                        msg.timestamp.toDate().toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    ) : (
                                                        new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    )
                                                ) : (
                                                    new Date().toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div
                            style={{
                                padding: '10px 15px',
                                background: '#f8f9fa',
                                borderTop: '1px solid #dee2e6',
                                maxHeight: '100px',
                                overflowY: 'auto'
                            }}
                        >
                            {attachments.map((att) => (
                                <div
                                    key={att.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '5px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <i className="fa fa-paperclip"></i>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {att.name}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveAttachment(att.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc3545',
                                            cursor: 'pointer',
                                            padding: '0 5px'
                                        }}
                                    >
                                        <i className="fa fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div
                        style={{
                            padding: '15px',
                            borderTop: '1px solid #dee2e6',
                            background: 'white'
                        }}
                    >
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
                                style={{ flexShrink: 0 }}
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
                                style={{ flexShrink: 0 }}
                            >
                                <i className="fa fa-paper-plane"></i>
                            </button>
                        </div>
                        <small className="text-muted">
                            PDF, resim ve video gönderebilirsiniz (max 10MB)
                        </small>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
