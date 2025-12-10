import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Header from '../component/Common/Header'
import Footer from '../component/Common/Footer'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { db } from '../firebaseConfig'
import firebase from 'firebase/app'

const Payment = () => {
    const history = useHistory()
    const location = useLocation()
    const carts = useSelector((state) => state.products.carts)
    const user = useSelector((state) => state.user.user)
    const status = useSelector((state) => state.user.status)
    
    const [totalAmount, setTotalAmount] = useState(0)
    const [enteredAmount, setEnteredAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [orderPlaced, setOrderPlaced] = useState(false)

    useEffect(() => {
        if (!status) {
            history.push('/login')
            return
        }

        if (carts.length === 0) {
            history.push('/cart')
            return
        }

        // Calculate total from location state or carts
        const locationTotal = location.state?.total
        if (locationTotal) {
            setTotalAmount(locationTotal)
        } else {
            const calculatedTotal = carts.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0
                const quantity = item.quantity || 1
                return sum + (price * quantity)
            }, 0)
            setTotalAmount(calculatedTotal)
        }
    }, [status, carts, history, location])

    const handlePaymentConfirm = async () => {
        const entered = parseFloat(enteredAmount)
        const expected = parseFloat(totalAmount.toFixed(2))

        if (isNaN(entered) || entered !== expected) {
            Swal.fire({
                title: 'Hatalı Tutar!',
                text: `Lütfen toplam tutarı doğru girin: ${expected.toFixed(2)} ₺`,
                icon: 'error',
                confirmButtonText: 'Tamam'
            })
            return
        }

        setLoading(true)

        try {
            const authUser = firebase.auth().currentUser
            if (!authUser) {
                throw new Error('Kullanıcı bulunamadı')
            }

            // Get selected address from localStorage or hidden input
            let selectedAddress = null
            try {
                const addressFromStorage = localStorage.getItem('selectedAddress')
                if (addressFromStorage) {
                    selectedAddress = JSON.parse(addressFromStorage)
                } else {
                    const addressInput = document.getElementById('selectedAddressData')
                    if (addressInput) {
                        selectedAddress = JSON.parse(addressInput.value)
                    }
                }
            } catch (error) {
                console.error('Adres okunurken hata:', error)
            }

            if (!selectedAddress) {
                Swal.fire({
                    title: 'Adres Seçilmedi!',
                    text: 'Lütfen checkout sayfasında bir adres seçin',
                    icon: 'error',
                    confirmButtonText: 'Tamam'
                })
                setLoading(false)
                return
            }

            // Prepare order data
            const orderItems = carts.map(item => ({
                productId: item.id,
                originalId: item.originalId || item.id,
                title: item.title,
                price: parseFloat(item.price) || 0,
                quantity: item.quantity || 1,
                image: item.img || item.image || ''
            }))

            const orderData = {
                userId: authUser.uid,
                userEmail: user?.email || authUser.email,
                userName: user?.name || 'Müşteri',
                items: orderItems,
                address: selectedAddress,
                subtotal: totalAmount,
                shipping: 0,
                total: totalAmount,
                status: 'pending',
                paymentStatus: 'confirmed',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }

            // Save order to Firebase
            const orderRef = await db.collection('users').doc(authUser.uid).collection('orders').add(orderData)
            const orderId = orderRef.id

            // Update user document with order reference
            await db.collection('users').doc(authUser.uid).set({
                lastOrderId: orderId,
                lastOrderDate: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })

            // Update product stocks
            const batch = db.batch()
            for (const item of carts) {
                const productRef = db.collection('products').doc(item.id.toString())
                const productDoc = await productRef.get()
                
                if (productDoc.exists) {
                    const currentStock = productDoc.data().stock || 0
                    const newStock = Math.max(0, currentStock - (item.quantity || 1))
                    batch.update(productRef, {
                        stock: newStock,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                }
            }
            await batch.commit()

            // Create invoice
            const invoiceNumber = `INV-${Date.now()}`
            const invoiceData = {
                orderId: orderId,
                invoiceNumber: invoiceNumber,
                ...orderData,
                invoiceDate: firebase.firestore.FieldValue.serverTimestamp()
            }

            // Save invoice to Firebase
            const invoiceRef = await db.collection('users').doc(authUser.uid).collection('invoices').add(invoiceData)

            // Update user document with invoice reference
            await db.collection('users').doc(authUser.uid).set({
                lastInvoiceId: invoiceRef.id,
                lastInvoiceDate: firebase.firestore.FieldValue.serverTimestamp(),
                invoices: firebase.firestore.FieldValue.arrayUnion(invoiceRef.id)
            }, { merge: true })

            // Generate and send invoice email
            try {
                const { generateInvoicePDF, sendInvoiceEmail } = await import('../utils/invoiceGenerator')
                const invoiceHTML = generateInvoicePDF({
                    ...invoiceData,
                    invoiceNumber: invoiceNumber
                })
                await sendInvoiceEmail(user?.email || authUser.email, invoiceHTML, invoiceNumber)
            } catch (error) {
                console.error('Invoice email gönderilirken hata:', error)
                // Don't fail the order if email fails
            }

            // Clear cart (will be done in Redux)
            // Note: Cart clearing will be handled in the success page

            setOrderPlaced(true)

            Swal.fire({
                title: 'Ödeme Onaylandı!',
                text: 'Siparişiniz alındı. Fatura e-postanıza gönderilecek.',
                icon: 'success',
                confirmButtonText: 'Tamam'
            }).then(() => {
                // Redirect to checkout success page
                history.push('/checkout-success', { orderId })
            })

        } catch (error) {
            console.error('Ödeme işlemi hatası:', error)
            Swal.fire({
                title: 'Hata!',
                text: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
                icon: 'error',
                confirmButtonText: 'Tamam'
            })
        } finally {
            setLoading(false)
        }
    }

    if (!status || carts.length === 0) {
        return null
    }

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="card shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="mb-4 text-center">Ödeme</h3>
                                    
                                    <div className="payment-summary mb-4 p-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                                        <h5>Sipariş Özeti</h5>
                                        <div className="row">
                                            <div className="col-6">
                                                <p className="mb-2">Ara Toplam:</p>
                                                <p className="mb-2">Kargo:</p>
                                                <hr />
                                                <p className="mb-0"><strong>Toplam:</strong></p>
                                            </div>
                                            <div className="col-6 text-right">
                                                <p className="mb-2">{totalAmount.toFixed(2)} ₺</p>
                                                <p className="mb-2">Ücretsiz</p>
                                                <hr />
                                                <p className="mb-0"><strong>{totalAmount.toFixed(2)} ₺</strong></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="payment-form">
                                        <div className="form-group">
                                            <label htmlFor="totalAmount"><strong>Toplam Tutarı Girin:</strong></label>
                                            <input
                                                type="number"
                                                className="form-control form-control-lg"
                                                id="totalAmount"
                                                value={enteredAmount}
                                                onChange={(e) => setEnteredAmount(e.target.value)}
                                                placeholder={`${totalAmount.toFixed(2)} ₺`}
                                                step="0.01"
                                                min="0"
                                                disabled={loading || orderPlaced}
                                            />
                                            <small className="form-text text-muted">
                                                Lütfen toplam tutarı doğru girin: <strong>{totalAmount.toFixed(2)} ₺</strong>
                                            </small>
                                        </div>

                                        <div className="text-center mt-4">
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handlePaymentConfirm}
                                                disabled={loading || orderPlaced || !enteredAmount}
                                                style={{minWidth: '200px'}}
                                            >
                                                {loading ? 'İşleniyor...' : orderPlaced ? 'Ödeme Onaylandı' : 'Ödemeyi Onayla'}
                                            </button>
                                        </div>
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

export default Payment

