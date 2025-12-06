import React from 'react'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import payment from '../../../assets/img/common/payment.png'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const FooterData = [
    {
        title: "BİLGİ",
        links: [
            { linkTitle: "Ana Sayfa", link: "/" },
            { linkTitle: "İletişim", link: "/contact" }
        ]
    },
    {
        title: "KATEGORİLER",
        links: [
            { linkTitle: "ELEKTRONİK", link: "/category/elektronik" },
            { linkTitle: "BİLGİSAYAR AKSESUARLARI", link: "/category/bilgisayar-aksesuarlari" },
            { linkTitle: "KAMERA & FOTOĞRAF", link: "/category/kamera-fotograf" },
            { linkTitle: "GENEL", link: "/category/genel" }
        ]
    }
]

const Footer = () => {

    return (
        <>
            <footer id="footer_one">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-12 col-sm-12 col-12">
                            <div className="footer_left_side">
                                <Link to="/" ><img src={logo} alt="Malikane Electronics Logo" style={{maxHeight: '80px'}} /></Link>
                                <p>
                                    <strong>Malikane Electronics</strong> - Teknoloji Sarayı olarak, en kaliteli elektronik ürünleri 
                                    uygun fiyatlarla müşterilerimize sunuyoruz. Stokta bulunan veya bulunmayan tüm ürünlerimiz 
                                    için bizimle iletişime geçebilirsiniz.
                                </p>
                                <div className="footer_left_side_icon">
                                    <ul>
                                        <li>
                                            <a 
                                                href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                title="WhatsApp ile İletişim"
                                            >
                                                <i className="fab fa-whatsapp" style={{color: '#25D366'}}></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="tel:+905393973949" title="Telefon Et">
                                                <i className="fa fa-phone" style={{color: '#007bff'}}></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="mailto:mufasabozyel@gmail.com" title="E-posta Gönder">
                                                <i className="fa fa-envelope" style={{color: '#dc3545'}}></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 col-12">
                            {FooterData.slice(0, 1).map((data, index) => (
                                <div className="footer_one_widget" key={index}>
                                    <h3>{data.title}</h3>
                                    <ul>
                                        {data.links.map((link, index) => (
                                            <li key={index}><Link to={link.link}>{link.linkTitle}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                        </div>
                        <div className="col-lg-2 col-md-6 col-sm-12 col-12">
                            {FooterData.slice(1, 2).map((data, index) => (
                                <div className="footer_one_widget" key={index}>
                                    <h3>{data.title}</h3>
                                    <ul>
                                        {data.links.map((link, index) => (
                                            <li key={index}><Link to={link.link}>{link.linkTitle}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="col-lg-3 col-md-12 col-sm-12 col-12">
                            <div className="footer_one_widget">
                                <h3>İLETİŞİM</h3>
                                <div className="contact-info">
                                    <p><i className="fa fa-phone"></i> <a href="tel:+905393973949">+90 539 397 39 49</a></p>
                                    <p><i className="fa fa-envelope"></i> <a href="mailto:mufasabozyel@gmail.com">mufasabozyel@gmail.com</a></p>
                                    <p><i className="fa fa-map-marker"></i> Gültepe, Girne Sokak No1-3d, Küçükçekmece İstanbul</p>
                                    <div className="whatsapp-contact" style={{marginTop: '15px'}}>
                                        <a 
                                            href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-success btn-sm"
                                            style={{
                                                backgroundColor: '#25D366',
                                                borderColor: '#25D366',
                                                borderRadius: '20px',
                                                padding: '8px 15px',
                                                fontSize: '14px',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <i className="fab fa-whatsapp"></i>
                                            WhatsApp Mesaj
                                        </a>
                                    </div>
                                </div>
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
                                <h6>© CopyRight 2025 <span>Malikane Electronics</span> - Teknoloji Sarayı</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Footer