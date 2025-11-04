import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'

const Header = () => {
    return (
        <>
            <header className="header-section">
                <div className="header-wrapper">
                    <div className="header-bottom header-bottom-color--golden section-fluid sticky-header sticky-color--golden">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 d-flex align-items-center justify-content-center">
                                    <div className="header-logo">
                                        <div className="logo">
                                            <Link to="/login"><img src={logo} alt="logo" style={{maxHeight: '80px'}} /></Link>
                                        </div>
                                    </div>
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

