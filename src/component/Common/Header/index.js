import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import { useSelector } from "react-redux";

const Header = () => {
    const status = useSelector((state) => state.user.status);

    return (
        <>
            <TopHeader />
            <header className="header-section d-none d-xl-block">
                <div className="header-wrapper">
                    <div className="header-bottom header-bottom-color--golden section-fluid sticky-header sticky-color--golden">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 d-flex align-items-center justify-content-center position-relative">
                                    <div className="header-logo">
                                        <div className="logo">
                                            <Link to="/"><img src={logo} alt="logo" /></Link>
                                        </div>
                                    </div>
                                    {status && (
                                        <div style={{position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)'}}>
                                            <Link to="/profile" className="d-flex align-items-center text-decoration-none">
                                                <i className="fa fa-user-circle" style={{fontSize: '28px', color: '#333', marginRight: '8px'}}></i>
                                                <span style={{fontSize: '16px', color: '#333', fontWeight: '500'}}>Profile</span>
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
                            <Link to="/">
                                <img src={logo} alt="Malikane Electronics Logo" />
                            </Link>
                        </div>

                        <div className="mobile-actions">
                            <button type="button" className="search-btn" onClick={handleSearch}>
                                <i className="fa fa-search"></i>
                            </button>
                            <Link 
                                to="/cart" 
                                className="cart-btn-mobile"
                                title="Sepetim"
                            >
                                <i className="fa fa-shopping-cart"></i>
                                {carts.length > 0 && (
                                    <span className="mobile-cart-badge">{carts.length}</span>
                                )}
                            </Link>
                            <a 
                                href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="whatsapp-btn-mobile"
                                title="WhatsApp ile İletişim"
                            >
                                <i className="fab fa-whatsapp"></i>
                            </a>
                            <button type="button" className="menu-btn" onClick={handlemenu}>
                                <i className="fa fa-bars"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="mobile-menu-offcanvas" className="offcanvas offcanvas-rightside offcanvas-mobile-menu-section">

                <div className="offcanvas-header text-right">
                    <button className="offcanvas-close" onClick={handlemenu}>
                        <img src={svg} alt="icon" />
                    </button>
                </div>
                <div className="offcanvas-mobile-menu-wrapper">
                    <div className="mobile-menu-bottom">
                        <div className="offcanvas-menu">
                            <ul>
                                <li>
                                    <Link to="/"><span>Ana Sayfa</span></Link>
                                </li>
                                {MenuData.map((item, index) => {
                                    // Kategoriler için accordion yapısı
                                    if (item.name === "KATEGORİLER" && item.children) {
                                        return (
                                            <li key={index} className={show === `menu-${index}` ? 'active' : ''}>
                                                <button 
                                                    type="button"
                                                    className="offcanvas-menu-expand"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleShow(`menu-${index}`);
                                                    }}
                                                >
                                                    <span>{item.name}</span>
                                                </button>
                                                <ul className="sub-menu mobile-category-menu">
                                                    {item.children.map((category, catIndex) => (
                                                        <li 
                                                            key={catIndex}
                                                            className={show === `submenu-${index}-${catIndex}` ? 'active' : ''}
                                                        >
                                                            {category.children && category.children.length > 0 ? (
                                                                <>
                                                                    <button 
                                                                        type="button"
                                                                        className="offcanvas-menu-expand"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleShow(`submenu-${index}-${catIndex}`);
                                                                        }}
                                                                    >
                                                                        <span>
                                                                            <i className="fa fa-folder-open"></i>
                                                                            {category.name}
                                                                        </span>
                                                                    </button>
                                                                    <ul className="sub-menu mobile-subcategory-menu">
                                                                        <li>
                                                                            <Link to={category.href}>
                                                                                <i className="fa fa-arrow-right"></i>
                                                                                Tümünü Gör
                                                                            </Link>
                                                                        </li>
                                                                        {category.children.map((subCategory, subIndex) => (
                                                                            <li key={subIndex}>
                                                                                <Link to={subCategory.href}>
                                                                                    <i className="fa fa-angle-right"></i>
                                                                                    {subCategory.name}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            ) : (
                                                                <Link to={category.href}>
                                                                    <span>
                                                                        <i className="fa fa-folder-open"></i>
                                                                        {category.name}
                                                                    </span>
                                                                </Link>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        );
                                    }
                                    // Diğer menü öğeleri
                                    return (
                                        <li key={index}>
                                            <Link to={item.href || "#!"}><span>{item.name}</span></Link>
                                        </li>
                                    );
                                })}
                                <li>
                                    <Link to="/contact"><span>İletişim</span></Link>
                                </li>
                                {/* Sepet ve Profil Linkleri */}
                                <li>
                                    <Link to="/cart" className="mobile-cart-link">
                                        <i className="fa fa-shopping-cart"></i>
                                        <span>Sepetim</span>
                                        {carts.length > 0 && (
                                            <span className="mobile-cart-count">({carts.length})</span>
                                        )}
                                    </Link>
                                </li>
                                {/* Kullanıcı Durumu */}
                                {userStatus ? (
                                    <>
                                        <li className="mobile-user-section">
                                            <Link to="/profile" className="mobile-user-link">
                                                <i className="fa fa-user-circle"></i>
                                                <span>Profilim</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/my-account" className="mobile-user-link">
                                                <i className="fa fa-cog"></i>
                                                <span>Hesabım</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <a 
                                                href="#!"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleLogout();
                                                    handlemenu(e);
                                                }}
                                                className="mobile-logout-link"
                                            >
                                                <i className="fa fa-sign-out"></i>
                                                <span>Çıkış Yap</span>
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="mobile-user-section">
                                            <Link to="/login" className="mobile-user-link">
                                                <i className="fa fa-sign-in"></i>
                                                <span>Giriş Yap</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/register" className="mobile-user-link">
                                                <i className="fa fa-user-plus"></i>
                                                <span>Kayıt Ol</span>
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Arama Bölümü */}
                        <div className="mobile-search-section" style={{padding: '20px 0', borderTop: '1px solid #eee', marginTop: '20px'}}>
                            <h4 style={{marginBottom: '15px', color: '#333'}}>Ürün Ara</h4>
                            <div className="mobile-search-box">
                                <input 
                                    type="text" 
                                    placeholder="Ürün adı, marka veya kategori ara..." 
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        border: '1px solid #ddd',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    style={{
                                        position: 'absolute',
                                        right: '5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: '#007bff',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '35px',
                                        height: '35px',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fa fa-search"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                    <div className="mobile-contact-info">
                        <div className="logo">
                            <Link to="/"><img src={logoWhite} alt="img" /></Link>
                        </div>
                        <address className="address">
                            <span>Adres: Gültepe, Girne Sokak No1-3d, Küçükçekmece İstanbul</span>
                            <span>Telefon: +90 539 397 39 49</span>
                            <span>E-posta: mufasabozyel@gmail.com</span>
                        </address>
                        <ul className="social-link">
                            <li>
                                <a 
                                    href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title="WhatsApp"
                                >
                                    <i className="fab fa-whatsapp" style={{color: '#25D366'}}></i>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+905393973949" title="Telefon">
                                    <i className="fa fa-phone" style={{color: '#007bff'}}></i>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:mufasabozyel@gmail.com" title="E-posta">
                                    <i className="fa fa-envelope" style={{color: '#dc3545'}}></i>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
            <div id="offcanvas-about" className="offcanvas offcanvas-rightside offcanvas-mobile-about-section">
                <div className="offcanvas-header text-right">
                    <button className="offcanvas-close" onClick={handleabout}>
                        <img src={svg} alt="icon" />
                    </button>
                </div>
                <div className="mobile-contact-info">
                    <address className="address">
                        <img src={logoWhite} alt="logo" />
                        <span>Address: Your address goes here.</span>
                        <span>Call Us: 0123456789, 0123456789</span>
                        <span>Email: demo@example.com</span>
                    </address>
                    <ul className="social-link">
                        <li>
                            <a href="#!"><i className="fa fa-facebook"></i></a>
                        </li>
                        <li>
                            <a href="#!"><i className="fa fa-twitter"></i></a>
                        </li>
                        <li>
                            <a href="#!"><i className="fa fa-instagram"></i></a>
                        </li>
                        <li>
                            <a href="#!"><i className="fa fa-linkedin"></i></a>
                        </li>
                    </ul>
                    <ul className="user-link">
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/checkout-one">Checkout</Link></li>
                    </ul>
                </div>
            </div>

            <div id="offcanvas-add-cart" className="offcanvas offcanvas-rightside offcanvas-add-cart-section">
                <div className="offcanvas-header text-right">
                    <button className="offcanvas-close" onClick={handleClick}>
                        <img src={svg} alt="icon" />
                    </button>
                </div>
                <div className="offcanvas-add-cart-wrapper">
                    <h4 className="offcanvas-title">Shopping Cart</h4>
                    <ul className="offcanvas-cart">
                        {carts.map((data, index) => (
                            <li className="offcanvas-wishlist-item-single" key={index}>
                                <div className="offcanvas-wishlist-item-block">
                                    <Link to={`/product-details-one/${data.id}`} className="offcanvas-wishlist-item-image-link" >
                                        <img src={data.img} alt="img"
                                            className="offcanvas-wishlist-image" />
                                    </Link>
                                    <div className="offcanvas-wishlist-item-content">
                                        <Link to={`/product-details-one/${data.id}`} className="offcanvas-wishlist-item-link">{data.title}</Link>
                                        <div className="offcanvas-wishlist-item-details">
                                            <span className="offcanvas-wishlist-item-details-quantity">{data.quantity || 1} x
                                            </span>
                                            <span className="offcanvas-wishlist-item-details-price"> ${data.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="offcanvas-wishlist-item-delete text-right">
                                    <a href="#!" className="offcanvas-wishlist-item-delete" onClick={() => rmCartProduct(data.id)}><i className="fa fa-trash"></i></a>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="offcanvas-cart-total-price">
                        <span className="offcanvas-cart-total-price-text">Subtotal:</span>
                        <span className="offcanvas-cart-total-price-value">${cartTotal()}.00</span>
                    </div>
                    <ul className="offcanvas-cart-action-button">
                        <li>
                            <Link to="/cart" className="theme-btn-one btn-black-overlay btn_md">Sepete Git</Link>
                        </li>
                        <li>
                            <Link to="/checkout" className="theme-btn-one btn-black-overlay btn_md">Ödemeye Geç</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="offcanvas-wishlish" className="offcanvas offcanvas-rightside offcanvas-add-cart-section">
                <div className="offcanvas-header text-right">
                    <button className="offcanvas-close" onClick={handleWish}>
                        <img src={svg} alt="icon" />
                    </button>
                </div>
                <div className="offcanvas-wishlist-wrapper">
                    <h4 className="offcanvas-title">Wishlist</h4>

                    <ul className="offcanvas-wishlist">
                        {favorites.map((data, index) => (
                            <li className="offcanvas-wishlist-item-single" key={index}>
                                <div className="offcanvas-wishlist-item-block">
                                    <Link to={`/product-details-one/${data.id}`} className="offcanvas-wishlist-item-image-link" >
                                        <img src={data.img} alt="img"
                                            className="offcanvas-wishlist-image" />
                                    </Link>
                                    <div className="offcanvas-wishlist-item-content">
                                        <Link to={`/product-details-one/${data.id}`} className="offcanvas-wishlist-item-link">{data.title}</Link>
                                        <div className="offcanvas-wishlist-item-details">
                                            <span className="offcanvas-wishlist-item-details-quantity">1 x
                                            </span>
                                            <span className="offcanvas-wishlist-item-details-price">{data.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="offcanvas-wishlist-item-delete text-right">
                                    <a href="#!" className="offcanvas-wishlist-item-delete" onClick={() => rmFavProduct(data.id)}><i className="fa fa-trash"></i></a>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <ul className="offcanvas-wishlist-action-button">
                        <li>
                            <Link to="/wishlist" className="theme-btn-one btn-black-overlay btn_md">View wishlist</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="search" className="search-modal">
                <button type="button" className="close" onClick={handleSearch}><img src={svg} alt="icon" /></button>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); Swal.fire('Success', 'Check out the Results', 'success'); history.push('/shop') }}>
                    <input type="search" placeholder="type keyword(s) here" required />
                    <button type="submit" className="btn btn-lg btn-main-search">Search</button>
                </form>
            </div>
        </>
    )
}

export default Header