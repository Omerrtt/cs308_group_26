import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const Payment = () => {
    const history = useHistory()
    const carts = useSelector((state) => state.products.carts)
    const [loading, setLoading] = useState(false)

    // Calculate total
    const subtotal = carts.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = item.quantity || 1
        return sum + (price * quantity)
    }, 0)
    const total = subtotal

    const handlePlaceOrder = () => {
        if (carts.length === 0) {
            alert('Sepetiniz boş!')
            return
        }

        // Ödeme sayfasına yönlendir
        history.push('/payment', { 
            total: total,
            subtotal: subtotal
        })
    }

    return (
        <>
            <div className="order_review bg-white">
                <div className="check-heading">
                    <h3>Ödeme</h3>
                </div>
                <div className="payment_method">
                    <div className="alert alert-info">
                        <p><strong>Ödeme Bilgisi:</strong></p>
                        <p>Ödeme işlemi için ödeme sayfasına yönlendirileceksiniz.</p>
                        <p className="mb-0"><strong>Toplam Tutar: {total.toFixed(2)} ₺</strong></p>
                    </div>
                </div>
                <button 
                    className="theme-btn-one btn-black-overlay btn_sm"
                    onClick={handlePlaceOrder}
                    disabled={loading || carts.length === 0}
                >
                    {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
                </button>
            </div>
        </>
    )
}

export default Payment
