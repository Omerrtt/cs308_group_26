import React, { useEffect, useState } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';
import { auth, db } from '../firebaseConfig';
import { store } from '../app/store';

const Checkout = () => {
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);
    
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(true);
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
                <Banner title="Checkout" />
                <section className="ptb-100">
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

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Sipariş Başarılı!',
            text: 'Siparişiniz alındı. Teşekkür ederiz!',
            confirmButtonText: 'Ana Sayfaya Dön'
        }).then(() => {
            history.push('/');
        });
    };

    return (
        <>
            <Header />
            <Banner title="Checkout" />
            <section className="ptb-100">
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
                                                disabled={cartItems.length === 0}
                                            >
                                                Siparişi Tamamla
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
