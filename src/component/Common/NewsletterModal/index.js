import React from 'react'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import Modal from 'react-bootstrap/Modal';
const NewsletterModal = (props) => {
    return (
        <>
            <Modal show={props.show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter" centered >
                <Modal.Body className="newsleetre_modal">
                    <div className="modal-content">
                        <div className="modal-body modal1 modal-bg">
                            <div className="row">
                                <div className="col-12">
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={props.start}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>

                                </div>
                                <div className="col-lg-12">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="offer_modal_left text-center" style={{
                                                padding: '40px 60px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '20px',
                                                color: 'white',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Background Pattern */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-50%',
                                                    right: '-50%',
                                                    width: '200%',
                                                    height: '200%',
                                                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                                    animation: 'float 6s ease-in-out infinite'
                                                }}></div>
                                                
                                                <img 
                                                    src={logo} 
                                                    alt="Malikane Electronics Logo" 
                                                    style={{
                                                        maxHeight: '150px',
                                                        marginBottom: '30px',
                                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }} 
                                                />
                                                
                                                <h3 style={{
                                                    fontSize: '28px',
                                                    fontWeight: '700',
                                                    marginBottom: '20px',
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                                    position: 'relative',
                                                    zIndex: 2
                                                }}>
                                                    Malikane Electronics
                                                </h3>
                                                
                                                <p style={{
                                                    fontSize: '18px',
                                                    lineHeight: '1.8',
                                                    marginBottom: '40px',
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                                    position: 'relative',
                                                    zIndex: 2,
                                                    maxWidth: '600px',
                                                    margin: '0 auto 40px auto'
                                                }}>
                                                    Stokta bulunan veya bulunmayan tüm ürünlerimiz hakkında detaylı bilgi almak ve sipariş vermek için bizimle iletişime geçebilirsiniz. 
                                                    Uzman ekibimiz size en uygun çözümleri sunmak için burada.
                                                </p>
                                                
                                                <a 
                                                    href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-success btn-lg"
                                                    style={{
                                                        backgroundColor: '#25D366',
                                                        borderColor: '#25D366',
                                                        padding: '15px 40px',
                                                        fontSize: '18px',
                                                        fontWeight: '700',
                                                        borderRadius: '50px',
                                                        textDecoration: 'none',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4)',
                                                        transition: 'all 0.3s ease',
                                                        position: 'relative',
                                                        zIndex: 2,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-3px)';
                                                        e.target.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.6)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.4)';
                                                    }}
                                                >
                                                    <i className="fab fa-whatsapp" style={{fontSize: '24px'}}></i>
                                                    WhatsApp ile İletişime Geçin
                                                </a>
                                                
                                                <div className="check_boxed_modal" style={{
                                                    marginTop: '30px',
                                                    position: 'relative',
                                                    zIndex: 2
                                                }}>
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="vehicle1" 
                                                        name="vehicle1" 
                                                        defaultValue="Bike" 
                                                        onClick={props.stop}
                                                        style={{
                                                            transform: 'scale(1.2)',
                                                            marginRight: '10px'
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor="vehicle1"
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                                                        }}
                                                    >
                                                        Bu popup'ı tekrar gösterme
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default NewsletterModal