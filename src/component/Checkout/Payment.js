import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { addOrder } from '../../app/slices/orders'
import Swal from 'sweetalert2'

const Payment = () => {
    const [paymentMethod, setPaymentMethod] = useState('bank-transfer')
    const dispatch = useDispatch()
    const history = useHistory()
    const carts = useSelector((state) => state.products.carts)
    const user = useSelector((state) => state.user.user)

    const calculateTotal = () => {
        return carts.reduce((total, item) => {
            return total + (item.price * (item.quantity || 1))
        }, 0)
    }

    const handlePlaceOrder = () => {
        if (carts.length === 0) {
            Swal.fire('Hata', 'Sepetiniz boş!', 'error')
            return
        }

        const orderData = {
            items: carts.map(item => ({
                id: item.id,
                title: item.title,
                img: item.img,
                price: item.price,
                quantity: item.quantity || 1
            })),
            total: calculateTotal(),
            itemCount: carts.length,
            paymentMethod: paymentMethod,
            userEmail: user?.email || 'guest@example.com',
            userName: user?.name || 'Guest User'
        }

        dispatch(addOrder(orderData))

        // Clear cart
        carts.forEach(item => {
            dispatch({ type: "products/removeCart", payload: { id: item.id } })
        })

        Swal.fire({
            icon: 'success',
            title: 'Sipariş Alındı!',
            text: 'Siparişiniz başarıyla oluşturuldu.',
            timer: 2000,
            showConfirmButton: false
        })

        setTimeout(() => {
            history.push('/my-account/customer-order')
        }, 2000)
    }

    return (
        <>
            <div className="order_review bg-white">
                <div className="check-heading">
                    <h3>Ödeme Yöntemi</h3>
                </div>
                <div className="payment_method">
                    <form>
                        <div className="accordion" id="accordionExample">
                            <div className="payment_area_wrappers">
                                <div className="heading_payment" id="headingOne">
                                    <div className="" data-toggle="collapse" data-target="#collapseOne" >
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            id="html" 
                                            value="bank-transfer" 
                                            checked={paymentMethod === 'bank-transfer'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="html">Banka Havalesi</label>
                                    </div>
                                </div>
                                <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                                    <div className="payment_body">
                                        <p>Banka havalesi ile ödeme yapabilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="payment_area_wrappers">
                                <div className="heading_payment" id="headingTwo">
                                    <div className="collapsed" data-toggle="collapse" data-target="#collapseTwo">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            id="javascript" 
                                            value="mobile-banking"
                                            checked={paymentMethod === 'mobile-banking'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="javascript">Mobil Bankacılık</label>
                                    </div>
                                </div>
                                <div id="collapseTwo" className="collapse" data-parent="#accordionExample">
                                    <div className="payment_body">
                                        <p>Mobil bankacılık ile ödeme yapabilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="payment_area_wrappers">
                                <div className="heading_payment" id="headingThree">
                                    <div className="collapsed" data-toggle="collapse" data-target="#collapseThree">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            id="css" 
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="css">Paypal</label>
                                    </div>
                                </div>
                                <div id="collapseThree" className="collapse" data-parent="#accordionExample">
                                    <div className="payment_body">
                                        <p>PayPal ile güvenli ödeme yapabilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <button 
                    className="theme-btn-one btn-black-overlay btn_sm"
                    onClick={handlePlaceOrder}
                    type="button"
                >
                    Siparişi Tamamla
                </button>
            </div>
        </>
    )
}

export default Payment