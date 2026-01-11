import React from 'react'
import { useHistory } from 'react-router';

const OrderTracking = () => {
    const history = useHistory()
    return (
        <>
            <section id="order_tracking" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3">
                            <div className="order_tracking_wrapper">
                                <h4>Sipariş Takibi</h4>
                                <p>Siparişinizi takip etmek için lütfen aşağıdaki kutuya Sipariş ID'nizi girin ve "Takip Et" butonuna basın.</p>

                                <form onSubmit={(e)=> {e.preventDefault();history.push('/order-complete')}}>
                                    <div className="form-group">
                                        <label htmlFor="order_ID">Sipariş ID</label>
                                        <input type="text" id="order_ID" className="form-control" placeholder="Sipariş onay e-postanızda bulunur" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="billing_email">Fatura E-postası</label>
                                        <input type="text" id="billing_email" className="form-control" placeholder="E-posta Adresinizi Girin" required/>
                                    </div>
                                    <div className="order_track_button">
                                        <button type="submit" className="theme-btn-one btn-black-overlay btn_md">Takip Et</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default OrderTracking
