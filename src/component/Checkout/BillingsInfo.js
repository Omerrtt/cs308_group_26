import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { db } from '../../firebaseConfig'
import firebase from 'firebase/app'

const BillingsInfo = () => {
    const user = useSelector((state) => state.user.user)
    const status = useSelector((state) => state.user.status)
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: user?.email || '',
        country: 'Türkiye',
        city: '',
        zipCode: '',
        fullAddress: '',
        phone: '',
        notes: ''
    })

    useEffect(() => {
        if (status && user?.email) {
            loadAddresses()
        }
    }, [status, user])

    const loadAddresses = async () => {
        if (!status || !user?.email) return
        
        try {
            // Firebase Auth'dan user ID'yi al
            const authUser = firebase.auth().currentUser
            if (!authUser) return

            const userDoc = await db.collection('users').doc(authUser.uid).get()
            if (userDoc.exists) {
                const userData = userDoc.data()
                const userAddresses = userData.addresses || []
                setAddresses(userAddresses)
                
                // İlk adresi varsa seç
                if (userAddresses.length > 0 && !selectedAddress) {
                    setSelectedAddress(userAddresses[0].id)
                }
            }
        } catch (error) {
            console.error('Adresler yüklenirken hata:', error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSaveAddress = async (e) => {
        e.preventDefault()
        if (!status || !user?.email) return

        setLoading(true)
        try {
            const authUser = firebase.auth().currentUser
            if (!authUser) {
                alert('Lütfen giriş yapın')
                return
            }

            const newAddress = {
                id: Date.now().toString(),
                ...formData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }

            const userRef = db.collection('users').doc(authUser.uid)
            const userDoc = await userRef.get()
            
            const currentAddresses = userDoc.exists ? (userDoc.data().addresses || []) : []
            const updatedAddresses = [...currentAddresses, newAddress]

            await userRef.set({
                ...userDoc.data(),
                addresses: updatedAddresses
            }, { merge: true })

            setAddresses(updatedAddresses)
            setSelectedAddress(newAddress.id)
            setShowAddForm(false)
            setFormData({
                firstName: '',
                lastName: '',
                companyName: '',
                email: user?.email || '',
                country: 'Türkiye',
                city: '',
                zipCode: '',
                fullAddress: '',
                phone: '',
                notes: ''
            })
        } catch (error) {
            console.error('Adres kaydedilirken hata:', error)
            alert('Adres kaydedilirken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const selectedAddressData = addresses.find(addr => addr.id === selectedAddress)

    return (
        <>
            <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                <div className="checkout-area-bg bg-white">
                    <div className="check-heading">
                        <h3>Fatura Bilgileri</h3>
                    </div>
                    
                    {/* Adres Seçimi */}
                    {addresses.length > 0 && (
                        <div className="mb-4">
                            <label className="form-label">Kayıtlı Adresler</label>
                            <select 
                                className="form-control"
                                value={selectedAddress || ''}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                            >
                                {addresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        {addr.fullAddress} - {addr.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Seçili Adres Detayları */}
                    {selectedAddressData && (
                        <div className="mb-4 p-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                            <h5>Seçili Adres:</h5>
                            <p className="mb-1"><strong>{selectedAddressData.firstName} {selectedAddressData.lastName}</strong></p>
                            <p className="mb-1">{selectedAddressData.fullAddress}</p>
                            <p className="mb-1">{selectedAddressData.city}, {selectedAddressData.zipCode}</p>
                            <p className="mb-1">{selectedAddressData.country}</p>
                            <p className="mb-0">{selectedAddressData.phone}</p>
                        </div>
                    )}

                    {/* Yeni Adres Ekle Butonu */}
                    <button 
                        className="btn btn-outline-primary mb-3"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Formu Kapat' : 'Yeni Adres Ekle'}
                    </button>

                    {/* Yeni Adres Formu */}
                    {showAddForm && (
                    <div className="check-out-form">
                            <form onSubmit={handleSaveAddress}>
                            <div className="row">
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                                    <div className="form-group">
                                            <label htmlFor="firstName">Ad <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                required 
                                                className="form-control" 
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="Ad" 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="lastName">Soyad <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                required 
                                                className="form-control" 
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Soyad" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="companyName">Şirket Adı</label>
                                            <input 
                                                className="form-control" 
                                                type="text" 
                                                id="companyName"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                placeholder="Şirket Adı" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="email">E-posta <span className="text-danger">*</span></label>
                                            <input 
                                                className="form-control" 
                                                required 
                                                type="email" 
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="info@example.com" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="phone">Telefon <span className="text-danger">*</span></label>
                                            <input 
                                                className="form-control" 
                                                required 
                                                type="tel" 
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+90 5XX XXX XX XX" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="form-group">
                                            <label htmlFor="country">Ülke <span className="text-danger">*</span></label>
                                            <select 
                                                className="form-control" 
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Türkiye">Türkiye</option>
                                                <option value="Diğer">Diğer</option>
                                        </select>
                                    </div>
                                </div>
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                                    <div className="form-group">
                                            <label htmlFor="city">Şehir <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Şehir" 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="zipCode">Posta Kodu <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="zipCode"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Posta Kodu" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <label htmlFor="fullAddress">Tam Adres <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="fullAddress"
                                                name="fullAddress"
                                                value={formData.fullAddress}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Tam adres bilgisi" 
                                            />
                                </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="form-group">
                                            <label htmlFor="notes">Ek Notlar</label>
                                            <textarea 
                                                rows="5" 
                                                className="form-control" 
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                placeholder="Sipariş notları"
                                            />
                                    </div>
                                </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Kaydediliyor...' : 'Adresi Kaydet'}
                                        </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    )}

                    {/* Seçili adresi localStorage'a kaydet (payment için) */}
                    {selectedAddressData && (
                        <>
                            <input 
                                type="hidden" 
                                id="selectedAddressData" 
                                value={JSON.stringify(selectedAddressData)}
                            />
                            {localStorage.setItem('selectedAddress', JSON.stringify(selectedAddressData))}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default BillingsInfo
