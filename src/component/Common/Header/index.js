import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import logoWhite from '../../../assets/img/malikane-electronics-logo-removebg-preview.png'
import { MenuData } from './MenuData'
import NaveItems from './NaveItems'
import TopHeader from './TopHeader'
import { useHistory } from "react-router-dom"
import svg from '../../../assets/img/svg/cancel.svg'

import { useDispatch, useSelector } from "react-redux";
import Swal from 'sweetalert2'
import { logout } from '../../../app/slices/user'
import { clearCart } from '../../../app/slices/products'
import { auth } from '../../../firebaseConfig'

const SALES_MANAGER_EMAIL = 'mbozyel349@gmail.com';

const Header = () => {
    const [click, setClick] = useState(false);
    const [show, setShow] = useState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const history = useHistory()
    const location = useLocation()
    let carts = useSelector((state) => state.products.carts);
    let favorites = useSelector((state) => state.products.favorites);
    let userStatus = useSelector((state) => state.user.status);
    let userData = useSelector((state) => state.user.user);
    let dispatch = useDispatch();
    const [isSalesManager, setIsSalesManager] = useState(false);

    // Sales manager kontrolü
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser && currentUser.email === SALES_MANAGER_EMAIL) {
                setIsSalesManager(true);
            } else {
                setIsSalesManager(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            // Firebase auth state listener zaten logout ve clearCart yapacak
            // Bu yüzden sadece signOut yapıyoruz
            await auth.signOut()
            
            Swal.fire({
                icon: 'success',
                title: 'Çıkış Yapıldı',
                text: 'Başarıyla çıkış yaptınız',
                timer: 1500,
                showConfirmButton: false
            })
            
            history.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: 'Çıkış yapılırken bir hata oluştu'
            })
        }
    }

    const rmCartProduct = (id) => {
        dispatch({ type: "products/removeCart", payload: { id } });
    }

    const rmFavProduct = (id) => {
        dispatch({ type: "products/removeFav", payload: { id } });
    }

    const cartTotal = () => {
        return carts.reduce(function (total, item) {
            return total + ((item.quantity || 1) * item.price)
        }, 0)
    }

    // Aynı sayfaya tıklandığında sayfayı yenile
    const handleLinkClick = (e, targetPath) => {
        if (location.pathname === targetPath) {
            e.preventDefault();
            window.location.reload();
        }
    }

    const handleClick = () => {
        if (click) {
            document.querySelector("#offcanvas-add-cart").style = ("transform: translateX(100%);")
        } else {
            document.querySelector("#offcanvas-add-cart").style = ("transform: translateX(0%);")
        }
        setClick(!click);
    }
    const handleWish = () => {
        if (click) {
            document.querySelector("#offcanvas-wishlish").style = ("transform: translateX(100%);")
        } else {
            document.querySelector("#offcanvas-wishlish").style = ("transform: translateX(0);")
        }
        setClick(!click);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (click) {
            document.querySelector("#search").style = ("transform: translate(-100%, 0); opacity: 0")
        } else {
            document.querySelector("#search").style = ("transform: translate(0px, 0px); opacity: 1")
        }
        setClick(!click);
    }
    const handleabout = () => {
        if (click) {
            document.querySelector("#offcanvas-about").style = ("transform: translateX(100%);")
        } else {
            document.querySelector("#offcanvas-about").style = ("transform: translateX(0%);")
        }
        setClick(!click);
    }
    const handlemenu = (e) => {
        e.preventDefault();
        const mobileMenu = document.querySelector("#mobile-menu-offcanvas");
        
        // Null check
        if (!mobileMenu) {
            console.warn('Mobile menu element not found');
            return;
        }
        
        // Toggle mobile menu
        const isOpen = !mobileMenuOpen;
        setMobileMenuOpen(isOpen);
        
        if (isOpen) {
            mobileMenu.style.transform = "translateX(0%)";
            mobileMenu.style.visibility = "visible";
            // Body scroll'u engelle
            document.body.style.overflow = "hidden";
        } else {
            mobileMenu.style.transform = "translateX(100%)";
            mobileMenu.style.visibility = "hidden";
            // Body scroll'u geri aç
            document.body.style.overflow = "";
        }
    }

    const handleShow = (value) => {
        value === show ? setShow("") : setShow(value)
    }

    // Sticky Menu Area
    const isSticky = (e) => {
        const header = document.querySelector('.header-section');
        // Null check - element henüz DOM'da yoksa işlem yapma
        if (!header) {
            return;
        }
        const scrollTop = window.scrollY;
        if (scrollTop >= 250) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }
    };

    useEffect(() => {
        // DOM yüklendikten sonra event listener ekle
        const handleScroll = () => {
            isSticky();
        };
        
        // Kısa bir delay ile kontrol et (DOM'un hazır olması için)
        const timeoutId = setTimeout(() => {
            window.addEventListener('scroll', handleScroll);
            // İlk scroll pozisyonunu kontrol et
            isSticky();
        }, 100);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Sadece mount/unmount'ta çalışsın

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (show === 'user-menu' && !event.target.closest('.user-profile-dropdown')) {
                setShow('');
            }
        };

        if (show === 'user-menu') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show]);

    return (
        <>
            <TopHeader />
            <header className="header-section d-none d-xl-block">
                <div className="header-wrapper">
                    <div className="header-bottom header-bottom-color--golden section-fluid sticky-header sticky-color--golden">
                        <div className="container">
                            <div className="row">
                                <div className="col-12 d-flex align-items-center">
                                    <div className="header-logo">
                                        <div className="logo">
                                            <Link 
                                                to="/"
                                                onClick={(e) => handleLinkClick(e, '/')}
                                            >
                                                <img src={logo} alt="logo" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="main-menu menu-color--black menu-hover-color--golden d-none d-xl-block">
                                        <nav>
                                            <ul>
                                                {MenuData.map((item, index) => (
                                                    <NaveItems item={item} key={index} />
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>

                                    <ul style={{
                                        display: 'flex', 
                                        gap: '30px', 
                                        alignItems: 'center',
                                        listStyle: 'none',
                                        margin: 0,
                                        padding: 0
                                    }}>
                                        <li style={{display: 'inline-block'}}>
                                            <Link 
                                                to="/cart" 
                                                title="Sepetim"
                                                style={{
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    textDecoration: 'none', 
                                                    color: '#333', 
                                                    position: 'relative',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = '#ff8a00';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = '#333';
                                                }}
                                            >
                                                <i className="fa fa-shopping-cart" style={{fontSize: '22px'}}></i>
                                                {carts.length > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#ff8a00',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>{carts.length}</span>
                                                )}
                                            </Link>
                                        </li>
                                        {isSalesManager && (
                                            <li style={{display: 'inline-block'}}>
                                                <Link 
                                                    to="/sales-manager"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '8px 16px',
                                                        background: '#ff8a00',
                                                        color: 'white',
                                                        textDecoration: 'none',
                                                        borderRadius: '4px',
                                                        fontWeight: '500',
                                                        fontSize: '14px',
                                                        transition: 'all 0.3s ease',
                                                        transform: 'scale(1)'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = '#e67a00';
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = '#ff8a00';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <i className="fa fa-chart-line"></i>
                                                    <span>Sales Panel</span>
                                                </Link>
                                            </li>
                                        )}
                                        {userStatus ? (
                                            <li style={{display: 'inline-block', position: 'relative'}} className="user-profile-dropdown">
                                                <a 
                                                    href="#!" 
                                                    className="user-profile-link"
                                                    style={{ 
                                                        color: '#333', 
                                                        fontWeight: '600', 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px', 
                                                        textDecoration: 'none',
                                                        transition: 'color 0.3s ease'
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleShow('user-menu');
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.color = '#ff8a00';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.color = '#333';
                                                    }}
                                                >
                                                    <i className="fa fa-user-circle" style={{ fontSize: '22px' }}></i>
                                                    <span>{userData.name || 'Kullanıcı'}</span>
                                                </a>
                                                {show === 'user-menu' && (
                                                    <div className="user-dropdown-menu" style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        background: 'white',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        borderRadius: '8px',
                                                        minWidth: '180px',
                                                        marginTop: '10px',
                                                        zIndex: 1000,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Link 
                                                            to="/profile"
                                                            onClick={() => setShow('')}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                padding: '12px 20px',
                                                                textDecoration: 'none',
                                                                color: '#333',
                                                                borderBottom: '1px solid #eee',
                                                                transition: 'background 0.2s ease'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.background = '#f8f9fa';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.background = 'white';
                                                            }}
                                                        >
                                                            <i className="fa fa-user"></i>
                                                            <span>Profilim</span>
                                                        </Link>
                                                        <a 
                                                            href="#!"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLogout();
                                                                setShow('');
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                padding: '12px 20px',
                                                                textDecoration: 'none',
                                                                color: '#dc3545',
                                                                transition: 'background 0.2s ease',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.background = '#f8f9fa';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.background = 'white';
                                                            }}
                                                        >
                                                            <i className="fa fa-sign-out"></i>
                                                            <span>Çıkış Yap</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </li>
                                        ) : (
                                            <>
                                                <li style={{display: 'inline-block'}}>
                                                    <Link 
                                                        to="/login"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '8px 16px',
                                                            background: '#007bff',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            borderRadius: '4px',
                                                            fontWeight: '500',
                                                            fontSize: '14px',
                                                            transition: 'all 0.3s ease',
                                                            transform: 'scale(1)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = '#0056b3';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = '#007bff';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <i className="fa fa-sign-in"></i>
                                                        <span>Giriş Yap</span>
                                                    </Link>
                                                </li>
                                                <li style={{display: 'inline-block'}}>
                                                    <Link 
                                                        to="/register"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '8px 16px',
                                                            background: '#28a745',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            borderRadius: '4px',
                                                            fontWeight: '500',
                                                            fontSize: '14px',
                                                            transition: 'all 0.3s ease',
                                                            transform: 'scale(1)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = '#1e7e34';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = '#28a745';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <i className="fa fa-user-plus"></i>
                                                        <span>Kayıt Ol</span>
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                        <li style={{display: 'inline-block'}}>
                                            <a 
                                                href="https://wa.me/905393973949?text=Merhaba, Malikane Electronics ürünleriniz hakkında bilgi almak istiyorum." 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                title="WhatsApp"
                                                style={{
                                                    display: 'inline-block',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <i className="fab fa-whatsapp" style={{fontSize: '28px', color: '#25D366'}}></i>
                                            </a>
                                        </li>
                                    </ul>
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
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

            <div 
                id="mobile-menu-offcanvas" 
                className="offcanvas offcanvas-rightside offcanvas-mobile-menu-section"
                style={{ 
                    transform: mobileMenuOpen ? "translateX(0%)" : "translateX(100%)",
                    visibility: mobileMenuOpen ? "visible" : "hidden"
                }}
            >

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
                                                                            <Link 
                                                                                to={category.href}
                                                                                onClick={(e) => handleLinkClick(e, category.href)}
                                                                            >
                                                                                <i className="fa fa-arrow-right"></i>
                                                                                Tümünü Gör
                                                                            </Link>
                                                                        </li>
                                                                        {category.children.map((subCategory, subIndex) => (
                                                                            <li key={subIndex}>
                                                                                <Link 
                                                                                    to={subCategory.href}
                                                                                    onClick={(e) => handleLinkClick(e, subCategory.href)}
                                                                                >
                                                                                    <i className="fa fa-angle-right"></i>
                                                                                    {subCategory.name}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            ) : (
                                                                <Link 
                                                                    to={category.href}
                                                                    onClick={(e) => handleLinkClick(e, category.href)}
                                                                >
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
                                            <Link 
                                                to={item.href || "#!"}
                                                onClick={(e) => item.href && handleLinkClick(e, item.href)}
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                                {/* Sepet ve Profil Linkleri */}
                                <li>
                                    <Link 
                                        to="/cart" 
                                        className="mobile-cart-link"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <i className="fa fa-shopping-cart"></i>
                                        <span>Sepetim</span>
                                        {carts.length > 0 && (
                                            <span className="mobile-cart-count">({carts.length})</span>
                                        )}
                                    </Link>
                                </li>
                                {/* Sales Manager Butonu */}
                                {isSalesManager && (
                                    <li className="mobile-user-section">
                                        <Link 
                                            to="/sales-manager" 
                                            className="mobile-user-link"
                                            onClick={(e) => handleLinkClick(e, '/sales-manager')}
                                        >
                                            <i className="fa fa-chart-line"></i>
                                            <span>Sales Panel</span>
                                        </Link>
                                    </li>
                                )}
                                {/* Kullanıcı Durumu */}
                                {userStatus ? (
                                    <>
                                        <li className="mobile-user-section">
                                            <Link 
                                                to="/profile" 
                                                className="mobile-user-link"
                                                onClick={(e) => handleLinkClick(e, '/profile')}
                                            >
                                                <i className="fa fa-user-circle"></i>
                                                <span>Profilim</span>
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
                                            <Link 
                                                to="/login" 
                                                className="mobile-user-link"
                                                onClick={(e) => handleLinkClick(e, '/login')}
                                            >
                                                <i className="fa fa-sign-in"></i>
                                                <span>Giriş Yap</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to="/register" 
                                                className="mobile-user-link"
                                                onClick={(e) => handleLinkClick(e, '/register')}
                                            >
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
                        <span>Adres: Gültepe, Girne Sokak No1-3d, Küçükçekmece İstanbul</span>
                        <span>Bizi Arayın: +90 539 397 39 49</span>
                        <span>E-posta: mufasabozyel@gmail.com</span>
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
                        <li><Link to="/wishlist">Favoriler</Link></li>
                        <li><Link to="/cart">Sepet</Link></li>
                        <li><Link to="/checkout-one">Ödeme</Link></li>
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
                    <h4 className="offcanvas-title">Alışveriş Sepeti</h4>
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
                        <span className="offcanvas-cart-total-price-text">Ara Toplam:</span>
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
                    <h4 className="offcanvas-title">Favoriler</h4>

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
                            <Link to="/wishlist" className="theme-btn-one btn-black-overlay btn_md">Favorileri Gör</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="search" className="search-modal">
                <button type="button" className="close" onClick={handleSearch}><img src={svg} alt="icon" /></button>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); Swal.fire('Başarılı', 'Sonuçları kontrol edin', 'success'); history.push('/shop') }}>
                    <input type="search" placeholder="Anahtar kelime(leri) buraya yazın" required />
                    <button type="submit" className="btn btn-lg btn-main-search">Ara</button>
                </form>
            </div>
        </>
    )
}

export default Header