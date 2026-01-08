import React from 'react'

import Header from '../../component/Common/Header'
import Footer from '../../component/Common/Footer'

const Contact = () => {
    return (
        <>
            {/* Ortak gezinme başlığını (Header) render et */}
            <Header />

            {/* Ana İletişim Bölümü: 'ptb-100' sınıfı muhtemelen üst ve alt boşluk (padding) ekliyor */}
            <section className="ptb-100">
                <div className="container">
                    <div className="row">

                        {/* Sol Sütun: İletişim Bilgileri 
                            col-lg-8 sınıfı ile büyük ekranlarda genişliğin yaklaşık %66'sını kaplar */}
                        <div className="col-lg-8">
                            <div className="contact-info">
                                <h2>İletişim Bilgileri</h2>
                                <div className="contact-details">

                                    {/* Telefon Numarası Bloğu */}
                                    <div className="contact-item">
                                        <h4><i className="fa fa-phone"></i> Telefon</h4>
                                        {/* 'tel:' protokolü mobil cihazlarda tıklandığında arama ekranını açar */}
                                        <p><a href="tel:+905393973949">+90 539 397 39 49</a></p>
                                    </div>

                                    {/* WhatsApp Doğrudan Bağlantı Bloğu */}
                                    <div className="contact-item">
                                        <h4><i className="fab fa-whatsapp"></i> WhatsApp</h4>
                                        <p>
                                            {/* wa.me bağlantısı, belirtilen numara ile önceden doldurulmuş bir mesaj içeren sohbet başlatır */}
                                            <a
                                                href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum."
                                                target="_blank"
                                                rel="noopener noreferrer" // target="_blank" kullanılırken güvenlik için gereklidir (reverse tabnabbing'i önler)
                                                className="whatsapp-link"
                                            >
                                                WhatsApp ile İletişime Geçin
                                            </a>
                                        </p>
                                    </div>

                                    {/* E-posta Bloğu */}
                                    <div className="contact-item">
                                        <h4><i className="fa fa-envelope"></i> E-posta</h4>
                                        {/* 'mailto:' protokolü kullanıcının varsayılan e-posta istemcisini açar */}
                                        <p><a href="mailto:mufasabozyel@gmail.com">mufasabozyel@gmail.com</a></p>
                                    </div>

                                    {/* Fiziksel Adres Bloğu */}
                                    <div className="contact-item">
                                        <h4><i className="fa fa-map-marker"></i> Adres</h4>
                                        <p>Malikane Electronics<br />Gültepe, Girne Sokak No1-3d<br />Küçükçekmece İstanbul</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sağ Sütun: Google Haritalar Gömme (Embed)
                            col-lg-4 sınıfı ile kalan genişliği kaplar */}
                        <div className="col-lg-4">
                            <div className="map-container">
                                <h3>Konumumuz</h3>
                                <div className="map-wrapper">
                                    {/* Haritayı gömmek için iframe.
                                      Not: Mevcut src (kaynak) adresi hatalı/placeholder gibi görünüyor. 
                                      Burası geçerli bir Google Maps Embed API URL'si ile değiştirilmelidir.
                                    */}
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d772.7931922189817!2d28.78989519417539!3d40.99508981310309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa393515ecf9f%3A0xeb8943a015a9e79b!2zR8O8bHRlcGUsIEdpcm5lIFNrLiwgMzQyOTUgS8O8w6fDvGvDp2VrbWVjZS_EsHN0YW5idWw!5e0!3m2!1sen!2str!4v1759954887422!5m2!1sen!2str"
                                        width="100%"
                                        height="450"
                                        style={{ border: 0, borderRadius: '10px' }}
                                        allowFullScreen=""
                                        loading="lazy" // Lazy loading, sayfanın ilk yüklenme performansını artırır
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Malikane Electronics Konumu" // Erişilebilirlik (Accessibility) için başlık
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ortak sayfa altbilgisini (Footer) render et */}
            <Footer />
        </>
    )
}

export default Contact