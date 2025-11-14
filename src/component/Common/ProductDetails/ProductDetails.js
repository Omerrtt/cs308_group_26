import React, { useState, useEffect, useRef } from 'react'
import RelatedProduct from './RelatedProduct'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
import { RatingStar } from "rating-star";
import Swal from 'sweetalert2';
import { getProductById } from '../../../app/data/productsData';
import { incrementWhatsAppClick, getProductWhatsAppClicks } from '../../../utils/whatsappTracker';

const ProductDetailsOne = () => {
    let dispatch = useDispatch();
    let { id } = useParams();
    
    // Gerçek ürün verilerini al
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const productData = getProductById(id);
        if (productData) {
            // WhatsApp tıklama sayısını local storage'dan al
            const whatsappClicks = getProductWhatsAppClicks(productData.id);
            const updatedProduct = {
                ...productData,
                whatsappClicks: whatsappClicks
            };
            setProduct(updatedProduct);
            // Redux store'u da güncelle
            dispatch({ type: "products/getProductById", payload: { id } });
        }
        setLoading(false);
    }, [id, dispatch]);
    
    // Product yüklendiğinde ana görseli ata - image attribute'unu öncelikli kullan
    useEffect(() => {
        if (product?.image) {
            setImg(product.image);
        } else if (product?.img) {
            setImg(product.img);
        } else if (product?.mainImage) {
            setImg(product.mainImage);
        } else if (product?.images?.length) {
            setImg(product.images[0]);
        } else {
            setImg(null);
        }
    }, [product]);

    // Add to cart
    const addToCart = async (id) => {
        dispatch({ type: "products/addToCart", payload: { id } })
    }

    // Add to Favorite
    const addToFav = async (id) => {
        dispatch({ type: "products/addToFav", payload: { id } })
    }

    // Add to Compare
    const addToComp = async (id) => {
        dispatch({ type: "products/addToComp", payload: { id } })
    }

    // WhatsApp tıklama sayısını artır
    const handleWhatsAppClick = (productId) => {
        const newCount = incrementWhatsAppClick(productId);
        // Ürün state'ini güncelle
        setProduct(prevProduct => ({
            ...prevProduct,
            whatsappClicks: newCount
        }));
    }

    // Color swatch fonksiyonu kaldırıldı - sadece ana görsel kullanıyoruz

    const [count, setCount] = useState(1)

    const [img, setImg] = useState(null)
    const [hoveredImage, setHoveredImage] = useState(null)
    const [isHovering, setIsHovering] = useState(false)
    
    // Placeholder görsel
    const PLACEHOLDER = "https://via.placeholder.com/800x600?text=G%C3%B6rsel+Bulunamad%C4%B1"
    
    // Hover timeout için ref
    const hoverTimeoutRef = useRef(null)
    
    // Gelişmiş hover fonksiyonları
    const handleThumbnailHover = (image) => {
        // Önceki timeout'u temizle
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        
        setIsHovering(true)
        setHoveredImage(image)
    }
    
    const handleThumbnailLeave = () => {
        // Kısa bir delay ile hover'ı temizle (flicker'ı önlemek için)
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovering(false)
            setHoveredImage(null)
        }, 100)
    }
    
    const handleThumbnailClick = (image) => {
        // Tıklama durumunda hover'ı hemen temizle
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        setIsHovering(false)
        setHoveredImage(null)
        setImg(image)
    }
    
    // Component unmount'ta timeout'u temizle
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
        }
    }, [])

    const incNum = () => {
        setCount(count + 1)
    }
    const decNum = () => {
        if (count > 1) {
            setCount(count - 1)
        } else {
            Swal.fire('Sorry!', "Minimun Quantity Reached",'warning')
            setCount(1)
        }
    }
    if (loading) {
        return (
            <section id="product_single_one" className="ptb-100">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Yükleniyor...</span>
                        </div>
                        <p className="mt-3">Ürün yükleniyor...</p>
                    </div>
                </div>
            </section>
        )
    }

    if (!product) {
        return (
            <section id="product_single_one" className="ptb-100">
                <div className="container">
                    <div className="text-center py-5">
                        <h3>Ürün bulunamadı</h3>
                        <p>Bu ürün mevcut değil veya kaldırılmış olabilir.</p>
                        <Link to="/shop" className="btn btn-primary">Alışverişe Dön</Link>
                    </div>
                </div>
            </section>
        )
    }

    const descriptionParagraphs = product.description
        ? product.description.split(/\n+/).map(paragraph => paragraph.trim()).filter(Boolean)
        : [];

    return (
        <>
            <section id="product_single_one" className="ptb-100">
                <div className="container">
                    <div className="row area_boxed">
                        <div className="col-lg-4">
                            <div className="product-image-container">
                                <div className="main-product-image">
                                    <img 
                                        src={isHovering && hoveredImage ? hoveredImage : (img || PLACEHOLDER)} 
                                        alt={product?.title || 'Ürün'} 
                                        className="main-image"
                                        onError={(e) => {
                                            e.currentTarget.src = PLACEHOLDER;
                                        }}
                                    />
                                    {/* Hover indicator */}
                                    {isHovering && (
                                        <div className="hover-indicator">
                                            <i className="fa fa-eye"></i>
                                            <span>Önizleme</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Thumbnail Galerisi */}
                                {product.images && product.images.length > 0 && (
                                    <div className="product-gallery mt-4">
                                        <h6 className="gallery-title">Ürün Görselleri</h6>
                                        <div className="gallery-thumbnails">
                                            {product.images.map((image, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`thumbnail-item ${img === image ? 'active' : ''} ${isHovering && hoveredImage === image ? 'hovering' : ''}`}
                                                    onClick={() => handleThumbnailClick(image)}
                                                    onMouseEnter={() => handleThumbnailHover(image)}
                                                    onMouseLeave={handleThumbnailLeave}
                                                >
                                                    <img 
                                                        src={image} 
                                                        alt={`${product?.title || 'Ürün'} ${index + 1}`}
                                                        className="thumbnail-image"
                                                        onError={(e) => {
                                                            e.currentTarget.src = PLACEHOLDER;
                                                        }}
                                                    />
                                                    {/* Hover overlay */}
                                                    <div className="thumbnail-hover-overlay">
                                                        <i className="fa fa-search-plus"></i>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="product_details_right_one">
                                <div className="modal_product_content_one">
                                    <h3>{product.title}</h3>
                                    <div className="brand-info mb-2">
                                        <small className="text-muted">Marka: {product.brand}</small>
                                    </div>
                                    <div className="product-code-info mb-2">
                                        <small className="text-muted">Ürün Kodu: <strong>{product.productCode}</strong></small>
                                    </div>
                                    {product.ean && (
                                        <div className="product-ean-info mb-3">
                                            <small className="text-muted">EAN: <strong>{product.ean}</strong></small>
                                        </div>
                                    )}
                                <div className="reviews_rating">
                                    <RatingStar maxScore={5} rating={product.rating} id="rating-star-common" />
                                    <span>({product.reviewCount} Müşteri Değerlendirmesi)</span>
                                </div>
                                
                                {/* WhatsApp İlgi Sayısı - Sadece 3 ve üzeri olduğunda göster */}
                                {(product.whatsappClicks || 0) >= 3 && (
                                    <div className="whatsapp-interest">
                                        <span className="interest-count">
                                            <i className="fab fa-whatsapp" style={{color: '#25D366', marginRight: '5px'}}></i>
                                            {product.whatsappClicks >= 10 ? `${product.whatsappClicks}+` : product.whatsappClicks} kişi bu ürünle ilgilendi
                                        </span>
                                    </div>
                                )}
                                <div className="price-section">
                                    <h4 className="current-price">₺{product.price.toLocaleString()}</h4>
                                    {product.originalPrice && product.originalPrice !== product.price && (
                                        <span className="original-price">Orijinal: ₺{product.originalPrice.toLocaleString()}</span>
                                    )}
                                    <div className="price-info mt-2">
                                        <small className="text-muted">
                                            <i className="fa fa-info-circle" style={{marginRight: '5px'}}></i>
                                            Fiyatlarımıza KDV dahildir ve ürünlerimiz faturalıdır
                                        </small>
                                        <div className="delivery-payment-info mt-2">
                                            <div className="delivery-info mb-3">
                                                <div className="alert alert-success py-2 px-3 mb-0" style={{fontSize: '0.9rem'}}>
                                                    <i className="fa fa-truck" style={{marginRight: '8px', fontSize: '1.1rem'}}></i>
                                                    <strong>Tahmini Teslim Tarihi:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { 
                                                        day: '2-digit', 
                                                        month: '2-digit', 
                                                        year: 'numeric' 
                                                    })}
                                                </div>
                                            </div>
                                            <div className="payment-info mb-3">
                                                <div className="alert alert-info py-2 px-3 mb-0" style={{fontSize: '0.9rem'}}>
                                                    <i className="fa fa-credit-card" style={{marginRight: '8px', fontSize: '1.1rem'}}></i>
                                                    <strong>Ödeme:</strong> Ürün tesliminde ödemenizi tüm kredi/banka kartlarıyla ya da nakit yapabilirsiniz.
                                                </div>
                                            </div>
                                            <div className="return-info">
                                                <small className="text-muted" style={{fontSize: '0.8rem'}}>
                                                    <i className="fa fa-undo" style={{marginRight: '5px'}}></i>
                                                    İade Süresi: 30 gün
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* WhatsApp ve Telefon İletişim Butonları - Fiyatın hemen altında */}
                                <div className="contact-buttons-price">
                                    <a 
                                        href={`https://wa.me/905393973949?text=Merhaba, ${product.title} ürünü hakkında bilgi almak istiyorum. Ürün Kodu: ${product.productCode} - Fiyat: ₺${product.price.toLocaleString()}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="whatsapp-btn-price"
                                        onClick={() => handleWhatsAppClick(product.id)}
                                    >
                                        <i className="fab fa-whatsapp" style={{fontSize: '18px', marginRight: '8px'}}></i>
                                        WhatsApp ile İletişim
                                    </a>
                                    <a 
                                        href="tel:+905393973949" 
                                        className="phone-btn-price"
                                    >
                                        <i className="fa fa-phone"></i>
                                        Telefon Et
                                    </a>
                                </div>
                                    {/* Color seçimi kaldırıldı - sadece ana görsel kullanıyoruz */}
                                    <form id="product_count_form_two">
                                        <div className="product_count_one">
                                            <div className="plus-minus-input">
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={decNum}>
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                </div>
                                                <input className="form-control" type="number" value={count} readOnly />
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={incNum}>
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                    {/* Ürün Açıklaması - Color bilgisinin altında */}
                                    <div className="product-description-section mt-4">
                                        <h5 className="description-title">Ürün Açıklaması</h5>
                                        <div className="description-content">
                                            {descriptionParagraphs.length > 0 ? (
                                                descriptionParagraphs.map((paragraph, index) => (
                                                    <p key={index}>{paragraph}</p>
                                                ))
                                            ) : (
                                                <p>Bu ürün için detaylı açıklama yakında eklenecektir.</p>
                                            )}
                                            {product.ean && (
                                                <p><strong>EAN:</strong> {product.ean}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="links_Product_areas">
                                        
                                        {/* WhatsApp ve Telefon İletişim Butonları */}
                                        <div className="contact-buttons">
                                            <a 
                                                href={`https://wa.me/905393973949?text=Merhaba, ${product.title} ürünü hakkında bilgi almak istiyorum. Ürün Kodu: ${product.productCode} - Fiyat: ₺${product.price.toLocaleString()}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="whatsapp-btn"
                                                onClick={() => handleWhatsAppClick(product.id)}
                                            >
                                                <i className="fab fa-whatsapp" style={{fontSize: '18px', marginRight: '8px'}}></i>
                                                WhatsApp ile İletişim
                                            </a>
                                            <a 
                                                href="tel:+905393973949" 
                                                className="phone-btn"
                                            >
                                                <i className="fa fa-phone"></i>
                                                Telefon Et
                                            </a>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <RelatedProduct />
        </>
    )
}

export default ProductDetailsOne