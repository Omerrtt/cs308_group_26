import React, { useState } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';

const Checkout = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const carts = useSelector((state) => state.products.carts);

    const [formData, setFormData] = useState({
        fullName: (user && user.name) || '',
        email: (user && user.email) || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    // Calculate Totals
    const calculateSubtotal = () => {
        return carts.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 29.90 : 0;
    const total = subtotal + shipping;

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

        if (carts.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Cart is Empty',
                text: 'Please add items to your cart before checking out'
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
            // Clear cart after successful order
            dispatch({ type: "products/clearCart" });
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
                                <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Order Summary</h4>

                                        <div className="order-items mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {carts.length === 0 ? (
                                                <div className="alert alert-info">
                                                    <p className="mb-0">No items in cart</p>
                                                </div>
                                            ) : (
                                                <ul className="list-group list-group-flush">
                                                    {carts.map((item) => (
                                                        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                            <div className="d-flex align-items-center">
                                                                <img src={item.img || item.image} alt={item.title} style={{ width: '40px', marginRight: '10px' }} />
                                                                <div>
                                                                    <h6 className="my-0" style={{ fontSize: '0.9rem' }}>{item.title}</h6>
                                                                    <small className="text-muted">Qty: {item.quantity}</small>
                                                                </div>
                                                            </div>
                                                            <span className="text-muted">₺{(item.price * item.quantity).toLocaleString()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="order-totals">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <strong>₺{subtotal.toLocaleString()}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Shipping:</span>
                                                <strong>₺{shipping.toLocaleString()}</strong>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between mb-4">
                                                <h5>Total:</h5>
                                                <h5><strong>₺{total.toLocaleString()}</strong></h5>
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
