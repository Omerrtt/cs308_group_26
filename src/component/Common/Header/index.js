import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import { useSelector } from "react-redux";

const Header = () => {
    const status = useSelector((state) => state.user.status);

    return (
        <>
            <header className="header-section">
                <div className="header-wrapper">
                    <div className="header-bottom header-bottom-color--golden section-fluid sticky-header sticky-color--golden">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 d-flex align-items-center justify-content-center position-relative">
                                    {status && (
                                        <div style={{position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)'}}>
                                            <Link to="/profile" className="d-flex align-items-center text-decoration-none">
                                                <i className="fa fa-user-circle" style={{fontSize: '28px', color: '#333', marginRight: '8px'}}></i>
                                                <span style={{fontSize: '16px', color: '#333', fontWeight: '500'}}>Profile</span>
                                            </Link>
                                        </div>
                                    )}
                                    <div className="header-logo">
                                        <div className="logo">
                                            <Link to="/login"><img src={logo} alt="logo" style={{maxHeight: '80px'}} /></Link>
                                        </div>
                                    </div>
                                    {status && (
                                        <div style={{position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)'}}>
                                            <Link to="/cart" className="d-flex align-items-center text-decoration-none">
                                                <i className="fa fa-shopping-cart" style={{fontSize: '28px', color: '#333', marginRight: '8px'}}></i>
                                                <span style={{fontSize: '16px', color: '#333', fontWeight: '500'}}>Cart</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mobile-header sticky-header sticky-color--golden mobile-header-bg-color--golden section-fluid d-lg-block d-xl-none">
                <div className="container">
                    <div className="mobile-header-content">
                        <div className="mobile-logo">
                            <Link to="/login">
                                <img src={logo} alt="Malikane Electronics Logo" style={{maxHeight: '60px'}} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header

