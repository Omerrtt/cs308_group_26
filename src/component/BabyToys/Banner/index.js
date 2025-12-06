import React from 'react'
import { Link } from 'react-router-dom'
import Img1 from '../../../assets/img/electronics/product/1.jpg'
import Img2 from '../../../assets/img/electronics/product/2.jpg'
import Img3 from '../../../assets/img/electronics/product/3.jpg'

const Banner = () => {
    return (
        <>
            <div id="baby_banner">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="baby_banner_img">
                                <Link to="/shop">
                                    <img src={Img1} alt="Malikanelectronics - Elektronik Ürünler" />
                                    <div className="banner_overlay">
                                        <div className="banner_content">
                                            <h2>Malikanelectronics</h2>
                                            <p>En kaliteli elektronik ürünler</p>
                                            <Link to="/shop" className="btn btn-primary">Alışverişe Başla</Link>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="row">
                                <div className="col-lg-12 col-md-6 col-sm-6 col-12">
                                    <div className="baby_banner_img banner_last_img">
                                        <Link to="/shop?category=bilgisayar-aksesuarlar">
                                            <img src={Img2} alt="Bilgisayar ve Aksesuarlar" />
                                            <div className="banner_overlay">
                                                <h5>Bilgisayar & Aksesuarlar</h5>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-6 col-sm-6 col-12">
                                    <div className="baby_banner_img banner_last_img">
                                        <Link to="/shop?category=kamera-fotograf">
                                            <img src={Img3} alt="Kamera ve Fotoğraf" />
                                            <div className="banner_overlay">
                                                <h5>Kamera & Fotoğraf</h5>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Banner