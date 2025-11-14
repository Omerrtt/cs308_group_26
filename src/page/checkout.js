import React, { useEffect, useState } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';

const Checkout = () => {
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);

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

    // Redirect to login if user is not authenticated
    useEffect(() => {
        if (!status) {
            history.push('/login');
        }
    }, [status, history]);

    // If user is not authenticated, don't render anything
    if (!status) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.fullName || !formData.email || !formData.phone || 
            !formData.address || !formData.city || !formData.zipCode) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all shipping information fields'
            });
            return;
        }

        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Payment Information',
                text: 'Please fill in all payment information fields'
            });
            return;
        }

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Order Placed Successfully!',
            text: 'Your order has been placed. Thank you for shopping with us!',
            confirmButtonText: 'Go to Homepage'
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
                                        <h4 className="mb-4">Shipping Information</h4>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Full Name *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    placeholder="John Doe"
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
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone *</label>
                                                <input 
                                                    type="tel" 
                                                    className="form-control" 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+1 234 567 8900"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">City *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="New York"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-8 mb-3">
                                                <label className="form-label">Address *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="123 Main Street, Apt 4B"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Zip Code *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    placeholder="10001"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Payment Information</h4>
                                        
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Card Number *</label>
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
                                                <label className="form-label">Cardholder Name *</label>
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
                                                <label className="form-label">Expiry Date *</label>
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
                                        <h4 className="mb-4">Order Summary</h4>
                                        
                                        <div className="order-items mb-4">
                                            <div className="alert alert-info">
                                                <p className="mb-0">No items in cart</p>
                                            </div>
                                        </div>

                                        <div className="order-totals">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <strong>$0.00</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Shipping:</span>
                                                <strong>$0.00</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Tax:</span>
                                                <strong>$0.00</strong>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between mb-4">
                                                <h5>Total:</h5>
                                                <h5><strong>$0.00</strong></h5>
                                            </div>

                                            <button 
                                                type="submit" 
                                                className="theme-btn-one btn-black-overlay btn_md w-100"
                                            >
                                                Place Order
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

