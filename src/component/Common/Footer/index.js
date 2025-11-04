import React from 'react'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <>
            <footer id="footer_one">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                            <div className="footer_left_side">
                                <Link to="/login"><img src={logo} alt="Malikane Electronics Logo" style={{maxHeight: '80px'}} /></Link>
                                <p>
                                    <strong>CS308 - Authentication System</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="go-top active" onClick={() => { window.scrollTo(0, 0) }}>
                    <i className="fa fa-chevron-up"></i>
                    <i className="fa fa-arrow-up"></i>
                </div>
            </footer>

            <section id="copyright_one">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="copyright_center text-center">
                                <h6>© CopyRight 2025 <span>CS308</span></h6>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Footer

