import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Header from '../component/Common/Header'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../app/slices/products'
import { Link } from 'react-router-dom'

const CheckoutSuccess = () => {
    const history = useHistory()
    const location = useLocation()
    const dispatch = useDispatch()
    const orderId = location.state?.orderId
    const [orderData, setOrderData] = useState(null)

    useEffect(() => {
        if (!orderId) {
            history.push('/')
            return
        }

        // Clear cart after successful order
        dispatch(clearCart())

        // You can fetch order details from Firebase here if needed
        // For now, we'll just show success message
    }, [orderId, history, dispatch])

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="card shadow-sm">
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
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default CheckoutSuccess

