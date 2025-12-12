import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Header from '../component/Common/Header'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../app/slices/products'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebaseConfig'
import { generateInvoicePDF } from '../utils/invoiceGenerator'

const CheckoutSuccess = () => {
    const history = useHistory()
    const location = useLocation()
    const dispatch = useDispatch()
    const orderId = location.state?.orderId
    const [orderData, setOrderData] = useState(null)
    const [invoiceData, setInvoiceData] = useState(null)
    const [invoicePdfUrl, setInvoicePdfUrl] = useState(null)
    const [loadingInvoice, setLoadingInvoice] = useState(true)

    useEffect(() => {
        if (!orderId) {
            history.push('/')
            return
        }

        // Clear cart after successful order
        dispatch(clearCart())

        // Firebase'den invoice verilerini çek
        const fetchInvoice = async () => {
            try {
                const currentUser = auth.currentUser
                if (!currentUser) {
                    setLoadingInvoice(false)
                    return
                }

                const userDoc = await db.collection('users').doc(currentUser.uid).get()
                if (userDoc.exists) {
                    const userData = userDoc.data()
                    const invoices = userData.invoices || []
                    const invoice = invoices.find(inv => inv.orderId === orderId)
                    
                    if (invoice) {
                        setInvoiceData(invoice)
                        
                        // PDF oluştur ve blob URL'e çevir
                        const invoicePDFBlob = generateInvoicePDF(invoice)
                        const pdfUrl = URL.createObjectURL(invoicePDFBlob)
                        setInvoicePdfUrl(pdfUrl)
                    }
                }
            } catch (error) {
                console.error('Fatura yükleme hatası:', error)
            } finally {
                setLoadingInvoice(false)
            }
        }

        fetchInvoice()
    }, [orderId, history, dispatch])

    // Cleanup: blob URL'i temizle
    useEffect(() => {
        return () => {
            if (invoicePdfUrl) {
                URL.revokeObjectURL(invoicePdfUrl)
            }
        }
    }, [invoicePdfUrl])

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="card shadow-sm mb-4">
                                <div className="card-body p-5 text-center">
                                    <div className="mb-4">
                                        <i className="fa fa-check-circle" style={{fontSize: '80px', color: '#28a745'}}></i>
                                    </div>
                                    <h2 className="mb-3">Siparişiniz Alındı!</h2>
                                    <p className="lead mb-4">
                                        Siparişiniz başarıyla alındı. Sipariş numaranız: <strong>{orderId || 'Yükleniyor...'}</strong>
                                    </p>
                                    <p className="mb-4">
                                        Fatura bilgileri e-postanıza gönderilecektir.
                                    </p>
                                    <div className="mt-4">
                                        <Link to="/" className="btn btn-primary btn-lg mr-3">
                                            Ana Sayfaya Dön
                                        </Link>
                                        <Link to="/my-account/customer-order" className="btn btn-outline-primary btn-lg">
                                            Siparişlerimi Görüntüle
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Fatura Görüntüsü */}
                            {loadingInvoice ? (
                                <div className="card shadow-sm">
                                    <div className="card-body p-5 text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="sr-only">Yükleniyor...</span>
                                        </div>
                                        <p className="mt-3">Fatura yükleniyor...</p>
                                    </div>
                                </div>
                            ) : invoicePdfUrl ? (
                                <div className="card shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <h4 className="mb-0">
                                            <i className="fa fa-file-pdf mr-2"></i>
                                            Fatura Görüntüsü
                                        </h4>
                                    </div>
                                    <div className="card-body p-0">
                                        <iframe
                                            src={invoicePdfUrl}
                                            style={{
                                                width: '100%',
                                                height: '800px',
                                                border: 'none'
                                            }}
                                            title="Fatura Görüntüsü"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="card shadow-sm">
                                    <div className="card-body p-5 text-center">
                                        <p className="text-muted">Fatura bilgisi bulunamadı.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default CheckoutSuccess



