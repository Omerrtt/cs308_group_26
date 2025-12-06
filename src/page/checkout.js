import React, { useEffect, useState } from 'react'
import Header from '../component/Common/Header'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';
import { auth, db } from '../firebaseConfig';
import { store } from '../app/store';
import firebase from 'firebase/app';
import { clearCart } from '../app/slices/products';
import { generateInvoicePDF } from '../utils/invoiceGenerator';

const Checkout = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);
    
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const [newAddress, setNewAddress] = useState({
        fullName: user.name || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        isDefault: false
    });

    // Redirect to login if user is not authenticated (sadece ilk yüklemede)
    useEffect(() => {
        // İlk kontrol yapıldıysa tekrar yönlendirme yapma (adres kaydetme sırasında tetiklenmesin)
        if (hasCheckedAuth) {
            return;
        }
        
        // localStorage'dan da kontrol et (hızlı yanıt için)
        const storedAuth = JSON.parse(localStorage.getItem('cs308_auth_state') || 'null');
        const hasStoredAuth = storedAuth && storedAuth.status && storedAuth.timestamp && (Date.now() - storedAuth.timestamp < 24 * 60 * 60 * 1000);
        
        // Eğer ne Redux'ta ne de localStorage'da auth yoksa, login sayfasına yönlendir
        if (!status && !hasStoredAuth) {
            setHasCheckedAuth(true);
            history.push('/login');
            return;
        }
        
        // Eğer Redux'ta yok ama localStorage'da varsa, Firebase doğrulamasını bekle (max 1 saniye)
        if (!status && hasStoredAuth) {
            const timeout = setTimeout(() => {
                const currentStatus = store.getState()?.user?.status;
                if (!currentStatus) {
                    setHasCheckedAuth(true);
                    history.push('/login');
        }
            }, 1000);
            
            return () => clearTimeout(timeout);
        }
        
        // Eğer status false ise, Firebase'den veri çekme
        if (!status) {
            setHasCheckedAuth(true);
            return;
        }
        
        setHasCheckedAuth(true);
        
        // Firebase'den cart ve addresses bilgilerini çek
        const loadCheckoutData = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    history.push('/login');
                    return;
                }
                
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    
                    // Cart items'ı yükle
                    if (userData.cart && Array.isArray(userData.cart) && userData.cart.length > 0) {
                        setCartItems(userData.cart);
                    } else {
                        // Eğer Firebase'de cart boşsa, Redux store'dan al
                        const reduxCarts = store.getState()?.products?.carts || [];
                        if (reduxCarts.length > 0) {
                            setCartItems(reduxCarts);
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Sepet Boş',
                                text: 'Sepetinizde ürün bulunmuyor.',
                                confirmButtonText: 'Alışverişe Dön'
                            }).then(() => {
                                history.push('/cart');
                            });
                            return;
                        }
                    }
                    
                    // Addresses'ı yükle
                    if (userData.addresses && Array.isArray(userData.addresses) && userData.addresses.length > 0) {
                        setAddresses(userData.addresses);
                        // Varsayılan adresi seç
                        const defaultAddress = userData.addresses.find(addr => addr.isDefault);
                        if (defaultAddress) {
                            setSelectedAddressId(defaultAddress.id);
                            setFormData(prev => ({
                                ...prev,
                                fullName: defaultAddress.fullName || user.name || '',
                                email: user.email || '',
                                phone: defaultAddress.phone || '',
                                address: defaultAddress.address || '',
                                city: defaultAddress.city || '',
                                zipCode: defaultAddress.zipCode || ''
                            }));
                        } else {
                            // İlk adresi seç
                            const firstAddress = userData.addresses[0];
                            setSelectedAddressId(firstAddress.id);
                            setFormData(prev => ({
                                ...prev,
                                fullName: firstAddress.fullName || user.name || '',
                                email: user.email || '',
                                phone: firstAddress.phone || '',
                                address: firstAddress.address || '',
                                city: firstAddress.city || '',
                                zipCode: firstAddress.zipCode || ''
                            }));
                        }
                    } else {
                        // Adres yoksa formu göster
                        setShowAddAddressForm(true);
                        setFormData(prev => ({
                            ...prev,
                            fullName: user.name || '',
                            email: user.email || ''
                        }));
                    }
                }
            } catch (error) {
                console.error('Checkout data yükleme hatası:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    text: 'Bilgiler yüklenirken bir hata oluştu.'
                });
            } finally {
                setLoading(false);
            }
        };
        
        loadCheckoutData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]); // Sadece status değişikliklerinde çalışsın, history dependency'si gereksiz

    // If user is not authenticated, don't render anything
    if (!status || loading) {
        return (
            <>
                <Header />
                <section className="ptb-100" style={{ paddingTop: '120px' }}>
                    <div className="container">
                        <div className="text-center">
                            <p>Yükleniyor...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);
    const shipping = 0; // Free shipping
    const tax = 0; // No tax
    const total = subtotal + shipping + tax;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        const address = addresses.find(addr => addr.id === addressId);
        if (address) {
            setFormData(prev => ({
                ...prev,
                fullName: address.fullName || user.name || '',
                phone: address.phone || '',
                address: address.address || '',
                city: address.city || '',
                zipCode: address.zipCode || ''
            }));
        }
    };

    const saveAddressToFirebase = async (userToUse) => {
        try {
            console.log('=== saveAddressToFirebase BAŞLADI ===');
            console.log('userToUse:', userToUse ? { uid: userToUse.uid, email: userToUse.email } : 'null');
            console.log('newAddress:', newAddress);
            console.log('mevcut addresses:', addresses);
            
            const addressId = Date.now().toString();
            const addressToAdd = {
                id: addressId,
                fullName: newAddress.fullName,
                phone: newAddress.phone,
                address: newAddress.address,
                city: newAddress.city,
                zipCode: newAddress.zipCode,
                isDefault: newAddress.isDefault || false,
                createdAt: new Date().toISOString()
            };

            console.log('Yeni adres eklenecek:', addressToAdd);

            // Mevcut adresleri al (Firebase'den güncel halini oku)
            const userRef = db.collection('users').doc(userToUse.uid);
            const userDoc = await userRef.get();
            
            let currentAddresses = [];
            if (userDoc.exists) {
                const userData = userDoc.data();
                currentAddresses = Array.isArray(userData.addresses) ? [...userData.addresses] : [];
                console.log('Firebase\'den mevcut adresler:', currentAddresses);
            } else {
                console.warn('User dokümanı bulunamadı, yeni oluşturulacak');
            }

            // Eğer default olarak işaretlendiyse, diğer adreslerin default'unu kaldır
            let updatedAddresses = [...currentAddresses];
            if (newAddress.isDefault) {
                updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
            }
            updatedAddresses.push(addressToAdd);

            console.log('Güncellenmiş adresler:', updatedAddresses);
            console.log('Firebase update başlıyor...');
            
            // Firebase'e kaydet - set ile merge kullan (BillingsInfo.js'deki gibi)
            try {
                if (userDoc.exists) {
                    // Doküman varsa update kullan
                    await userRef.update({
                        addresses: updatedAddresses
                    });
                    console.log('✅ Firebase update başarılı!');
                } else {
                    // Doküman yoksa set ile merge kullan
                    await userRef.set({
                        addresses: updatedAddresses
                    }, { merge: true });
                    console.log('✅ Firebase set (merge) başarılı!');
                }
            } catch (updateError) {
                console.error('❌ Firebase update hatası:', updateError);
                console.error('Error code:', updateError.code);
                console.error('Error message:', updateError.message);
                console.error('Error stack:', updateError.stack);
                throw updateError;
            }

            // Firestore'dan tekrar okuyarak doğrula
            console.log('Firestore\'dan doğrulama okunuyor...');
            const verifyDoc = await userRef.get();
            if (verifyDoc.exists) {
                const verifyData = verifyDoc.data();
                console.log('✅ Firebase\'den doğrulama - addresses:', verifyData.addresses);
                console.log('Addresses sayısı:', verifyData.addresses?.length || 0);
                
                // Eğer kayıt başarısız olduysa uyar
                if (!verifyData.addresses || verifyData.addresses.length !== updatedAddresses.length) {
                    console.error('❌ Adres sayısı eşleşmiyor!');
                    console.error('Beklenen:', updatedAddresses.length);
                    console.error('Firebase\'de:', verifyData.addresses?.length || 0);
                }
            } else {
                console.error('❌ Firestore dokümanı bulunamadı!');
            }
            
            console.log('=== saveAddressToFirebase TAMAMLANDI ===');

            setAddresses(updatedAddresses);
            setSelectedAddressId(addressId);
            setFormData(prev => ({
                ...prev,
                fullName: newAddress.fullName,
                phone: newAddress.phone,
                address: newAddress.address,
                city: newAddress.city,
                zipCode: newAddress.zipCode
            }));
            setShowAddAddressForm(false);
            setNewAddress({
                fullName: user.name || '',
                phone: '',
                address: '',
                city: '',
                zipCode: '',
                isDefault: false
            });

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Adres Firebase\'e kaydedildi',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('saveAddressToFirebase hatası:', error);
            throw error; // Hata yukarıya fırlatılsın
        }
    };

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // İç form submit edildiğinde dış formun submit edilmesini engelle
        
        console.log('=== ADRES KAYDETME BAŞLADI ===');
        console.log('newAddress state:', newAddress);
        
        if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.zipCode) {
            console.log('Eksik bilgi hatası');
            Swal.fire({
                icon: 'error',
                title: 'Eksik Bilgi',
                text: 'Lütfen tüm alanları doldurun'
            });
            return;
        }

        try {
            console.log('Auth kontrolü başlıyor...');
            const currentUser = auth.currentUser;
            console.log('auth.currentUser:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'null');
            
            // Eğer currentUser yoksa, localStorage'dan kontrol et
            if (!currentUser) {
                console.log('currentUser yok, localStorage kontrol ediliyor...');
                const storedAuth = JSON.parse(localStorage.getItem('cs308_auth_state') || 'null');
                console.log('storedAuth:', storedAuth);
                
                if (!storedAuth || !storedAuth.status) {
                    console.log('localStorage\'da auth yok');
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oturum Sonlandı',
                        text: 'Lütfen tekrar giriş yapın',
                        confirmButtonText: 'Giriş Yap'
                    }).then(() => {
                        history.push('/login');
                    });
                    return;
                }
                
                // localStorage'da varsa, Firebase auth state listener'ın çalışmasını bekle
                // Ama önce Redux store'dan kontrol et
                const reduxStatus = store.getState()?.user?.status;
                console.log('Redux status:', reduxStatus);
                
                if (reduxStatus) {
                    // Redux'ta status true ise, auth.currentUser henüz hazır olmayabilir
                    // Biraz bekle ve tekrar dene
                    console.log('Redux\'ta status true, 500ms bekleniyor...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const retryUser = auth.currentUser;
                    console.log('Retry user:', retryUser ? { uid: retryUser.uid } : 'null');
                    
                    if (retryUser) {
                        console.log('Retry user bulundu, adres kaydediliyor...');
                        await saveAddressToFirebase(retryUser);
                        return;
                    }
                }
                
                // Eğer hala user yoksa, hata göster
                console.log('User hala bulunamadı');
                Swal.fire({
                    icon: 'error',
                    title: 'Oturum Hatası',
                    text: 'Lütfen sayfayı yenileyip tekrar deneyin',
                    confirmButtonText: 'Tamam'
                });
                return;
            }

            // currentUser varsa, direkt kaydet
            console.log('currentUser bulundu, adres kaydediliyor...');
            await saveAddressToFirebase(currentUser);
            console.log('=== ADRES KAYDETME TAMAMLANDI ===');
        } catch (error) {
            console.error('=== ADRES EKLEME HATASI ===');
            console.error('Error object:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Permission hatası ise
            if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                console.error('Permission denied hatası');
                Swal.fire({
                    icon: 'error',
                    title: 'Yetki Hatası',
                    text: 'Adres eklemek için giriş yapmanız gerekiyor',
                    confirmButtonText: 'Giriş Yap'
                }).then(() => {
                    history.push('/login');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    html: `
                        <p>Adres eklenirken bir hata oluştu:</p>
                        <p><strong>Kod:</strong> ${error.code || 'Yok'}</p>
                        <p><strong>Mesaj:</strong> ${error.message || 'Bilinmeyen hata'}</p>
                        <p>Lütfen console'u kontrol edin.</p>
                    `,
                    confirmButtonText: 'Tamam'
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.fullName || !formData.email || !formData.phone || 
            !formData.address || !formData.city || !formData.zipCode) {
            Swal.fire({
                icon: 'error',
                title: 'Eksik Bilgi',
                text: 'Lütfen tüm teslimat bilgilerini doldurun'
            });
            return;
        }

        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
            Swal.fire({
                icon: 'error',
                title: 'Eksik Bilgi',
                text: 'Lütfen tüm ödeme bilgilerini doldurun'
            });
            return;
        }

        // Sepet kontrolü
        if (cartItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sepet Boş',
                text: 'Sepetinizde ürün bulunmuyor'
            });
            return;
        }

        // Submit başladı - loading state'i aktif et
        setSubmitting(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oturum Hatası',
                    text: 'Lütfen giriş yapın'
                }).then(() => {
                    history.push('/login');
                });
                return;
            }

            // Sipariş ID oluştur
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            // Sipariş tarihi
            const orderDate = new Date();
            
            // Tahmini teslimat tarihi (7 gün sonra)
            const estimatedDeliveryDate = new Date();
            estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);
            
            // Delivery address oluştur
            const deliveryAddress = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zipCode: formData.zipCode
            };

            // Sipariş öğeleri
            const orderItems = cartItems.map(item => ({
                id: item.id,
                originalId: item.originalId || item.id,
                title: item.title,
                price: parseFloat(item.price) || 0,
                quantity: item.quantity || 1,
                image: item.img || item.image || '',
                total: (parseFloat(item.price) || 0) * (item.quantity || 1)
            }));

            // Sipariş verisi (array içinde serverTimestamp kullanılamaz, string kullanıyoruz)
            const orderData = {
                orderId: orderId,
                orderDate: orderDate.toISOString(), // ISO string formatında
                orderDateTimestamp: orderDate.getTime(), // Timestamp (number)
                orderDateString: orderDate.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total,
                paymentStatus: 'confirmed', // Ödeme başarılı
                paymentMethod: 'credit_card',
                deliveryAddress: deliveryAddress,
                estimatedDelivery: estimatedDeliveryDate.toISOString(), // ISO string formatında
                estimatedDeliveryTimestamp: estimatedDeliveryDate.getTime(), // Timestamp (number)
                estimatedDeliveryString: estimatedDeliveryDate.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                status: 'processing', // Sipariş durumu: processing, in-transit, delivered
                createdAt: orderDate.toISOString(), // ISO string formatında
                createdAtTimestamp: orderDate.getTime(), // Timestamp (number)
                updatedAt: orderDate.toISOString(), // ISO string formatında
                updatedAtTimestamp: orderDate.getTime() // Timestamp (number)
            };

            console.log('Sipariş kaydediliyor:', orderData);

            // Firebase'e kaydet - users collection'ındaki orders array'ine ekle
            const userRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await userRef.get();
            
            let currentOrders = [];
            if (userDoc.exists) {
                const userData = userDoc.data();
                currentOrders = Array.isArray(userData.orders) ? [...userData.orders] : [];
            }
            
            // Yeni siparişi ekle
            currentOrders.push(orderData);
            
            // Invoice (Fatura) oluştur
            const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const invoiceDate = new Date();
            
            const invoiceData = {
                invoiceId: invoiceId,
                orderId: orderId,
                invoiceNumber: invoiceId,
                invoiceDate: invoiceDate.toISOString(),
                invoiceDateTimestamp: invoiceDate.getTime(),
                invoiceDateString: invoiceDate.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                // Müşteri bilgileri
                customer: {
                    name: user.name || formData.fullName,
                    email: user.email || formData.email,
                    phone: formData.phone
                },
                // Fatura adresi (billing address - teslimat adresi ile aynı)
                billingAddress: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode
                },
                // Teslimat adresi
                shippingAddress: deliveryAddress,
                // Ürünler
                items: orderItems,
                // Fiyat bilgileri
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total,
                // Ödeme bilgileri
                paymentStatus: 'confirmed',
                paymentMethod: 'credit_card',
                paymentDate: invoiceDate.toISOString(),
                // Sipariş durumu
                orderStatus: 'processing',
                // Fatura durumu
                invoiceStatus: 'issued', // issued, paid, cancelled
                // Tarih bilgileri
                createdAt: invoiceDate.toISOString(),
                createdAtTimestamp: invoiceDate.getTime(),
                updatedAt: invoiceDate.toISOString(),
                updatedAtTimestamp: invoiceDate.getTime()
            };

            console.log('Fatura oluşturuluyor:', invoiceData);

            // Mevcut invoice'ları al
            let currentInvoices = [];
            if (userDoc.exists) {
                const userData = userDoc.data();
                currentInvoices = Array.isArray(userData.invoices) ? [...userData.invoices] : [];
            }
            
            // Yeni faturayı ekle
            currentInvoices.push(invoiceData);
            
            // Orders collection'ına kaydetmek için order document verisi
            const orderDocumentData = {
                orderId: orderId,
                invoiceNumber: invoiceId, // Invoice number
                userId: currentUser.uid,
                userName: user.name || formData.fullName,
                userEmail: user.email || formData.email,
                orderDate: orderDate.toISOString(),
                orderDateTimestamp: orderDate.getTime(),
                orderDateString: orderDate.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total,
                paymentStatus: 'confirmed',
                paymentMethod: 'credit_card',
                deliveryAddress: deliveryAddress,
                estimatedDelivery: estimatedDeliveryDate.toISOString(),
                estimatedDeliveryTimestamp: estimatedDeliveryDate.getTime(),
                estimatedDeliveryString: estimatedDeliveryDate.toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                status: 'processing',
                comment: formData.notes || '', // Kullanıcı notları/comment
                createdAt: orderDate.toISOString(),
                createdAtTimestamp: orderDate.getTime(),
                updatedAt: orderDate.toISOString(),
                updatedAtTimestamp: orderDate.getTime()
            };

            // ÖNCE Orders collection'ına kaydet (ana kaynak)
            console.log('📦 Orders collection\'a kaydediliyor...');
            console.log('Order ID:', orderId);
            console.log('Order Document Data keys:', Object.keys(orderDocumentData));
            
            try {
                const orderRef = db.collection('orders').doc(orderId);
                await orderRef.set(orderDocumentData);
                
                console.log('✅ Sipariş orders collection\'a kaydedildi (Order ID: ' + orderId + ')');
                console.log('✅ Orders collection document path: orders/' + orderId);
            } catch (orderCollectionError) {
                console.error('❌ Orders collection\'a kaydetme hatası:', orderCollectionError);
                console.error('❌ Hata detayları:', {
                    message: orderCollectionError.message,
                    code: orderCollectionError.code,
                    stack: orderCollectionError.stack
                });
                
                // Orders collection'a kaydetme hatası kritik - siparişi engelle
                throw new Error(`Orders collection'a kaydetme hatası: ${orderCollectionError.message}`);
            }

            // SONRA Firebase'e kaydet - users collection'ındaki orders array'ini güncelle
            await userRef.update({
                orders: currentOrders,
                invoices: currentInvoices,
                cart: [] // Sepeti temizle
            });

            console.log('✅ Sipariş users collection\'a kaydedildi');

            console.log('✅ Fatura Firebase\'e kaydedildi');

            // Invoice PDF oluştur, indir ve email gönder
            try {
                console.log('Invoice PDF oluşturuluyor...');
                const invoicePDFBlob = generateInvoicePDF(invoiceData);
                console.log('✅ PDF oluşturuldu');
                
                // PDF'i otomatik indir
                const pdfUrl = URL.createObjectURL(invoicePDFBlob);
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `Fatura_${invoiceId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 100);
                
                console.log('✅ PDF indirildi');
                
                // PDF'i base64'e çevir ve email gönder
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        const base64data = reader.result.split(',')[1];
                        resolve(base64data);
                    };
                    reader.onerror = reject;
                });
                reader.readAsDataURL(invoicePDFBlob);
                const pdfBase64 = await base64Promise;
                
                // Firebase Functions ile email gönder
                const customerEmail = invoiceData.customer?.email || formData.email;
                console.log('=== EMAIL GÖNDERME BAŞLIYOR ===');
                console.log('Customer Email:', customerEmail);
                console.log('Invoice Data:', invoiceData);
                console.log('PDF Base64 length:', pdfBase64?.length || 0);
                
                if (customerEmail) {
                    console.log('📧 Email gönderiliyor:', customerEmail);
                    try {
                        const functions = firebase.functions();
                        const sendInvoiceEmailFunction = functions.httpsCallable('sendInvoiceEmail');
                        
                        const toName = invoiceData.customer?.name || invoiceData.billingAddress?.fullName || 'Müşteri';
                        
                        console.log('Function çağrılıyor...');
                        console.log('Parameters:', {
                            toEmail: customerEmail,
                            toName: toName,
                            invoiceId: invoiceData.invoiceId,
                            orderId: invoiceData.orderId,
                            pdfBase64Length: pdfBase64?.length || 0
                        });
                        
                        const result = await sendInvoiceEmailFunction({
                            toEmail: customerEmail,
                            toName: toName,
                            invoiceData: invoiceData,
                            pdfBase64: pdfBase64
                        });
                        
                        console.log('✅ Email gönderildi!');
                        console.log('Result:', result.data);
                    } catch (emailError) {
                        console.error('❌ Email gönderme hatası:');
                        console.error('Error code:', emailError.code);
                        console.error('Error message:', emailError.message);
                        console.error('Error details:', emailError.details);
                        console.error('Full error:', emailError);
                        // Email hatası siparişi engellemez
                    }
                } else {
                    console.warn('⚠️ Müşteri email adresi bulunamadı, email gönderilemedi');
                }
            } catch (pdfError) {
                console.error('❌ PDF oluşturma hatası (sipariş yine de başarılı):', pdfError);
                // PDF hatası siparişi engellemez
            }

            // Ürün stoklarını güncelle
            try {
                console.log('Ürün stokları güncelleniyor...');
                const batch = db.batch();
                let stockUpdateCount = 0;
                
                for (const item of orderItems) {
                    // Ürün ID'sini al (originalId varsa onu kullan, yoksa id)
                    const productId = item.originalId || item.id;
                    const productRef = db.collection('products').doc(productId.toString());
                    const productDoc = await productRef.get();
                    
                    if (productDoc.exists) {
                        const productData = productDoc.data();
                        const currentStock = typeof productData.stock === 'number' 
                            ? productData.stock 
                            : parseInt(productData.stock, 10) || 0;
                        
                        const quantityToDeduct = item.quantity || 1;
                        const newStock = Math.max(0, currentStock - quantityToDeduct);
                        
                        batch.update(productRef, {
                            stock: newStock,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        stockUpdateCount++;
                        console.log(`  - Ürün ${productId}: ${currentStock} → ${newStock} (${quantityToDeduct} adet düşüldü)`);
                    } else {
                        console.warn(`  ⚠️ Ürün bulunamadı: ${productId}`);
                    }
                }
                
                if (stockUpdateCount > 0) {
                    await batch.commit();
                    console.log(`✅ ${stockUpdateCount} ürünün stoku güncellendi`);
                } else {
                    console.warn('⚠️ Güncellenecek ürün bulunamadı');
                }
            } catch (stockError) {
                console.error('❌ Stok güncelleme hatası:', stockError);
                // Stok hatası siparişi engellemez, sadece logla
            }

            // Redux store'dan sepeti temizle
            dispatch(clearCart());

            // Başarı mesajı
        Swal.fire({
            icon: 'success',
                title: 'Sipariş Başarılı!',
                html: `
                    <p>Siparişiniz başarıyla alındı.</p>
                    <p><strong>Sipariş No:</strong> ${orderId}</p>
                    <p><strong>Fatura No:</strong> ${invoiceId}</p>
                    <p><strong>Tutar:</strong> ${total.toFixed(2)} ₺</p>
                    <p><strong>Tahmini Teslimat:</strong> ${orderData.estimatedDeliveryString}</p>
                `,
                confirmButtonText: 'Ana Sayfaya Dön'
        }).then(() => {
            history.push('/');
        });

        } catch (error) {
            console.error('Sipariş kaydetme hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: 'Sipariş kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
            });
        } finally {
            // Submit bitti - loading state'i kapat
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <section className="ptb-100" style={{ paddingTop: '120px' }}>
                <div className="container">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-lg-8">
                                {/* Shipping Information */}
                                <div className="card shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h4 className="mb-0">Teslimat Bilgileri</h4>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                                            >
                                                {showAddAddressForm ? 'Adresleri Göster' : 'Yeni Adres Ekle'}
                                            </button>
                                        </div>

                                        {/* Mevcut Adresler */}
                                        {!showAddAddressForm && addresses.length > 0 && (
                                            <div className="mb-4">
                                                <label className="form-label mb-3">Kayıtlı Adresleriniz</label>
                                                {addresses.map((address) => (
                                                    <div 
                                                        key={address.id}
                                                        className={`card mb-3 ${selectedAddressId === address.id ? 'border-primary' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleAddressSelect(address.id)}
                                                    >
                                                        <div className="card-body">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="selectedAddress"
                                                                    checked={selectedAddressId === address.id}
                                                                    onChange={() => handleAddressSelect(address.id)}
                                                                />
                                                                <label className="form-check-label w-100">
                                                                    <strong>{address.fullName}</strong>
                                                                    {address.isDefault && <span className="badge bg-primary ms-2">Varsayılan</span>}
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {address.address}, {address.city} {address.zipCode}
                                                                        <br />
                                                                        Tel: {address.phone}
                                                                    </small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Yeni Adres Formu */}
                                        {showAddAddressForm && (
                                            <div className="mb-4 p-3 border rounded">
                                                <h5 className="mb-3">Yeni Adres Ekle</h5>
                                                <div onSubmit={handleSaveNewAddress}>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Ad Soyad *</label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                name="fullName"
                                                                value={newAddress.fullName}
                                                                onChange={handleNewAddressChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Telefon *</label>
                                                            <input 
                                                                type="tel" 
                                                                className="form-control" 
                                                                name="phone"
                                                                value={newAddress.phone}
                                                                onChange={handleNewAddressChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-8 mb-3">
                                                            <label className="form-label">Adres *</label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                name="address"
                                                                value={newAddress.address}
                                                                onChange={handleNewAddressChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Posta Kodu *</label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                name="zipCode"
                                                                value={newAddress.zipCode}
                                                                onChange={handleNewAddressChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Şehir *</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            name="city"
                                                            value={newAddress.city}
                                                            onChange={handleNewAddressChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                name="isDefault"
                                                                checked={newAddress.isDefault}
                                                                onChange={handleNewAddressChange}
                                                            />
                                                            <label className="form-check-label">
                                                                Varsayılan adres olarak kaydet
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-primary"
                                                            onClick={handleSaveNewAddress}
                                                        >
                                                            Adresi Kaydet
                                                        </button>
                                                        {addresses.length > 0 && (
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-secondary"
                                                                onClick={() => setShowAddAddressForm(false)}
                                                            >
                                                                İptal
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Teslimat Formu */}
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Ad Soyad *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email *</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control" 
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Telefon *</label>
                                                <input 
                                                    type="tel" 
                                                    className="form-control" 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Şehir *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-8 mb-3">
                                                <label className="form-label">Adres *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Posta Kodu *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Ödeme Bilgileri</h4>
                                        
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Kart Numarası *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Kart Sahibi Adı *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="cardName"
                                                    value={formData.cardName}
                                                    onChange={handleInputChange}
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Son Kullanma Tarihi *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">CVV *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    placeholder="123"
                                                    maxLength="4"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                {/* Order Summary */}
                                <div className="card shadow-sm sticky-top" style={{top: '20px'}}>
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Sipariş Özeti</h4>
                                        
                                        <div className="order-items mb-4">
                                            {cartItems.length === 0 ? (
                                            <div className="alert alert-info">
                                                    <p className="mb-0">Sepetiniz boş</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {cartItems.map((item) => {
                                                        const itemPrice = parseFloat(item.price) || 0;
                                                        const itemQuantity = item.quantity || 1;
                                                        const itemTotal = itemPrice * itemQuantity;
                                                        return (
                                                            <div key={item.id} className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                                                <div className="flex-grow-1">
                                                                    <strong>{item.title}</strong>
                                                                    <br />
                                                                    <small className="text-muted">Adet: {itemQuantity}</small>
                                                                </div>
                                                                <div className="text-end">
                                                                    <strong>{itemTotal.toFixed(2)} ₺</strong>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                            )}
                                        </div>

                                        <div className="order-totals">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Ara Toplam:</span>
                                                <strong>{subtotal.toFixed(2)} ₺</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Kargo:</span>
                                                <strong>Ücretsiz</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>KDV:</span>
                                                <strong>{tax.toFixed(2)} ₺</strong>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between mb-4">
                                                <h5>Toplam:</h5>
                                                <h5><strong>{total.toFixed(2)} ₺</strong></h5>
                                            </div>

                                            <button 
                                                type="submit" 
                                                className="theme-btn-one btn-black-overlay btn_md w-100"
                                                disabled={cartItems.length === 0 || submitting}
                                                style={{ 
                                                    position: 'relative',
                                                    opacity: submitting ? 0.7 : 1,
                                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ 
                                                            width: '1rem', 
                                                            height: '1rem',
                                                            borderWidth: '2px',
                                                            verticalAlign: 'middle'
                                                        }}></span>
                                                        Sipariş Tamamlanıyor...
                                                    </>
                                                ) : (
                                                    'Siparişi Tamamla'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Checkout
