import React from 'react'
import Header from '../../component/Common/Header'
import Footer from '../../component/Common/Footer'

const Contact = () => {
    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="contact-info">
                                <h2>İletişim Bilgileri</h2>
                                <div className="contact-details">
                                    <div className="contact-item">
                                        <h4><i className="fa fa-phone"></i> Telefon</h4>
                                        <p><a href="tel:+905393973949">+90 539 397 39 49</a></p>
                                    </div>
                                    <div className="contact-item">
                                        <h4><i className="fab fa-whatsapp"></i> WhatsApp</h4>
                                        <p>
                                            <a 
                                                href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="whatsapp-link"
                                            >
                                                WhatsApp ile İletişime Geçin
                                            </a>
                                        </p>
                                    </div>
                                    <div className="contact-item">
                                        <h4><i className="fa fa-envelope"></i> E-posta</h4>
                                        <p><a href="mailto:mufasabozyel@gmail.com">mufasabozyel@gmail.com</a></p>
                                    </div>
                                    <div className="contact-item">
                                        <h4><i className="fa fa-map-marker"></i> Adres</h4>
                                        <p>Malikane Electronics<br />Gültepe, Girne Sokak No1-3d<br />Küçükçekmece İstanbul</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="map-container">
                                <h3>Konumumuz</h3>
                                <div className="map-wrapper">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d772.7931922189817!2d28.78989519417539!3d40.99508981310309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa393515ecf9f%3A0xeb8943a015a9e79b!2zR8O8bHRlcGUsIEdpcm5lIFNrLiwgMzQyOTUgS8O8w6fDvGvDp2VrbWVjZS_EsHN0YW5idWw!5e0!3m2!1sen!2str!4v1759954887422!5m2!1sen!2str"
                                        width="100%"
                                        height="450"
                                        style={{ border: 0, borderRadius: '10px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Malikane Electronics Konumu"
                                    ></iframe>
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

export default Contact