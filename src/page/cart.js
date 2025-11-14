import React, { useEffect } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

const Cart = () => {
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);

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

    return (
        <>
            <Header />
            <Banner title="Shopping Cart" />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="cart-content">
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h3 className="mb-4 text-center">My Shopping Cart</h3>
                                        
                                        <div className="cart-items">
                                            <div className="alert alert-info text-center">
                                                <i className="fa fa-shopping-cart" style={{fontSize: '48px', marginBottom: '15px', display: 'block'}}></i>
                                                <h5>Your cart is empty</h5>
                                                <p className="mb-0">Add some products to your cart to see them here!</p>
                                            </div>
                                        </div>

                                        <div className="cart-summary mt-4 p-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h5>Cart Summary</h5>
                                                </div>
                                                <div className="col-md-6 text-right">
                                                    <p className="mb-2">Subtotal: <strong>$0.00</strong></p>
                                                    <p className="mb-2">Shipping: <strong>$0.00</strong></p>
                                                    <hr />
                                                    <h5>Total: <strong>$0.00</strong></h5>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-12 text-center">
                                                    <Link 
                                                        to="/checkout"
                                                        className="theme-btn-one btn-black-overlay btn_md"
                                                    >
                                                        Proceed to Checkout
                                                    </Link>
                                                </div>
                                            </div>
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

export default Cart

