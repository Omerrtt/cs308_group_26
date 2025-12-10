import React, { useState, useEffect, useRef } from 'react'
import RelatedProduct from './RelatedProduct'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { RatingStar } from "rating-star";
import Swal from 'sweetalert2';
import { getProductById } from '../../../app/data/productsData';
import { incrementWhatsAppClick, getProductWhatsAppClicks } from '../../../utils/whatsappTracker';
import { db } from '../../../firebaseConfig';

const ProductDetailsOne = () => {
    let dispatch = useDispatch();
    let { id } = useParams();
    const history = useHistory();
    
    // Gerçek ürün verilerini al
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllComments, setShowAllComments] = useState(false);
    const [approvedComments, setApprovedComments] = useState([]);
    const [realRating, setRealRating] = useState(null); // Firebase'den gelen gerçek rating
    const [realRatingCount, setRealRatingCount] = useState(0); // Firebase'den gelen gerçek rating sayısı
    
    useEffect(() => {
        let unsubscribe = null;

        const fetchProductAndSetupListener = async () => {
            setLoading(true);
            try {
                // İlk olarak static veriyi al (varsa) veya temel bilgileri kur
                let productData = await getProductById(id);
                
                // Product ID'yi bul - farklı formatları dene
                const productIdStr = (id || (productData && (productData.id || productData.originalId))).toString();
                
                // Firestore referansını bul
                let productRef = db.collection('products').doc(productIdStr);
                let productDoc = await productRef.get();
                
                // Eğer document bulunamazsa, farklı formatları dene
                if (!productDoc.exists) {
                    if (!productIdStr.startsWith('0') && productIdStr.length < 9) {
                        const paddedId = '0' + productIdStr;
                        productRef = db.collection('products').doc(paddedId);
                        productDoc = await productRef.get();
                    }
                    
                    if (!productDoc.exists && productIdStr.startsWith('0')) {
                        const unpaddedId = productIdStr.replace(/^0+/, '');
                        productRef = db.collection('products').doc(unpaddedId);
                        productDoc = await productRef.get();
                    }
                }

                // Listener kur
                if (productRef) {
                    unsubscribe = productRef.onSnapshot((doc) => {
                        if (doc.exists) {
                            const firebaseData = doc.data();
                            
                            // Eğer productData null ise (örneğin JSON'da yoksa), Firebase verisiyle oluştur
                            if (!productData) {
                                productData = { ...firebaseData, id: doc.id };
                            }

                            // Stok bilgisini Firebase'den güncelle
                            const updatedProduct = {
                                ...productData,
                                ...firebaseData, // Firebase'deki tüm güncel verileri al (stok dahil)
                                id: productData.id // ID'yi koru
                            };

                            // WhatsApp tıklama sayısını local storage'dan al
                            const whatsappClicks = getProductWhatsAppClicks(updatedProduct.id);
                            updatedProduct.whatsappClicks = whatsappClicks;

                            // Commentleri işle
                            const comments = firebaseData.approvedComments || [];
                            const ratings = firebaseData.ratings || [];
                            
                            const commentsWithRatings = comments.map(comment => {
                                const userRating = ratings.find(r => 
                                    r.userId === comment.userId && 
                                    r.orderId === comment.orderId
                                );
                                return {
                                    ...comment,
                                    rating: userRating ? userRating.rating : null
                                };
                            });
                            
                            commentsWithRatings.sort((a, b) => {
                                const dateA = new Date(a.createdAt || a.approvedAt || 0).getTime();
                                const dateB = new Date(b.createdAt || b.approvedAt || 0).getTime();
                                return dateB - dateA;
                            });
                            
                            setApprovedComments(commentsWithRatings);
                            setRealRating(firebaseData.rating);
                            setRealRatingCount(firebaseData.ratingCount || ratings.length);
                            setProduct(updatedProduct);
                            
                            // Redux store'u da güncelle (opsiyonel, eğer redux kullanılıyorsa)
                            // dispatch({ type: "products/updateProductStock", payload: { id: updatedProduct.id, stock: updatedProduct.stock } });
                        }
                    }, (error) => {
                        console.error("Firebase listen error:", error);
                    });
                }

                if (productData) {
                     // WhatsApp tıklama sayısını local storage'dan al (ilk render için)
                    const whatsappClicks = getProductWhatsAppClicks(productData.id);
                    setProduct({
                        ...productData,
                        whatsappClicks: whatsappClicks
                    });
                } else if (!productDoc.exists) {
                     console.warn(`⚠️ ProductDetails: ID ${id} ile ürün bulunamadı`);
                     setProduct(null);
                }

            } catch (error) {
                console.error('❌ ProductDetails: Ürün yüklenirken hata:', error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProductAndSetupListener();

        // Cleanup listener
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
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
        if (product?.stock && count >= product.stock) {
            Swal.fire('Stok Sınırı', `Stokta sadece ${product.stock} adet var.`, 'warning')
            setCount(product.stock)
            return
        }
        setCount(count + 1)
    }
    const decNum = () => {
        if (count > 1) {
            setCount(count - 1)
        } else {
            Swal.fire('Üzgünüz!', "Minimum Adete Ulaşıldı",'warning')
            setCount(1)
        }
    }

    const handleAddToCartClick = () => {
        if (!product) return;

        if (!product.stock || product.stock <= 0) {
            Swal.fire('Stok Yok', 'Bu ürün stokta olmadığı için sepete eklenemez.', 'warning')
            return
        }

        if (count > product.stock) {
            Swal.fire('Stok Sınırı', `En fazla ${product.stock} adet seçebilirsiniz.`, 'info')
            setCount(product.stock)
            return
        }

        dispatch({ type: "products/addToCart", payload: { id: product.id, quantity: count } })
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

    // Tüm görselleri birleştir: image + images array'i
    const getAllImages = () => {
        const allImages = [];
        
        // Önce ana görseli ekle (image)
        if (product?.image) {
            allImages.push(product.image);
        } else if (product?.img) {
            allImages.push(product.img);
        } else if (product?.mainImage) {
            allImages.push(product.mainImage);
        }
        
        // Sonra images array'indeki görselleri ekle (tekrar edenleri hariç tut)
        if (product?.images && Array.isArray(product.images)) {
            product.images.forEach(img => {
                if (img && !allImages.includes(img)) {
                    allImages.push(img);
                }
            });
        }
        
        return allImages;
    };

    const allImages = getAllImages();

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
                                {allImages.length > 0 && (
                                    <div className="product-gallery mt-4">
                                        <h6 className="gallery-title">Ürün Görselleri</h6>
                                        <div className="gallery-thumbnails">
                                            {allImages.map((image, index) => (
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
                                    <div className="product-id-info mb-2">
                                        <small className="text-muted">
                                            Product ID: <strong>{product.originalId || product.id}</strong>
                                        </small>
                                    </div>
                                    {product.ean && (
                                        <div className="product-ean-info mb-2">
                                            <small className="text-muted">EAN: <strong>{product.ean}</strong></small>
                                        </div>
                                    )}
                                    {product.warrantyStatus && (
                                        <div className="product-warranty-info mb-2">
                                            <small className="text-muted">
                                                <i className="fa fa-shield-alt" style={{marginRight: '5px', color: '#28a745'}}></i>
                                                Garanti: <strong>{product.warrantyStatus}</strong>
                                            </small>
                                        </div>
                                    )}
                                    {product.distributor && (
                                        <div className="product-distributor-info mb-3">
                                            <small className="text-muted">
                                                <i className="fa fa-building" style={{marginRight: '5px', color: '#007bff'}}></i>
                                                Distribütör: <strong>{product.distributor}</strong>
                                            </small>
                                        </div>
                                    )}
                                <div className="reviews_rating">
                                    <RatingStar 
                                        maxScore={5} 
                                        rating={realRating !== null ? realRating : (product.rating || 0)} 
                                        id="rating-star-common" 
                                    />
                                    <span>
                                        ({realRatingCount > 0 ? realRatingCount : (product.reviewCount || 0)} Müşteri Değerlendirmesi)
                                    </span>
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
                                    <div className="stock-status mt-2">
                                        <small 
                                            className={`badge ${product.stock > 3 ? 'bg-success' : 'bg-warning text-dark'}`}
                                            title="Stok durumu"
                                        >
                                            {product.stock ? `Stokta ${product.stock} adet var` : 'Stok bilgisi yakında'}
                                        </small>
                                    </div>
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
                                    <div className="add-to-cart-section mt-3">
                                        <button 
                                            type="button" 
                                            className="btn btn-primary theme-btn-one"
                                            onClick={handleAddToCartClick}
                                            disabled={!product.stock || product.stock <= 0}
                                        >
                                            Sepete Ekle
                                        </button>
                                        {(!product.stock || product.stock <= 0) && (
                                            <small className="text-danger d-block mt-2">
                                                Bu ürün şu anda stokta yok.
                                            </small>
                                        )}
                                    </div>
                                    
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
                                    
                                    {/* Müşteri Yorumları */}
                                    {((approvedComments.length > 0) || (product.all_comments && product.all_comments.length > 0)) && (
                                        <div className="product-comments-section mt-4">
                                            <h5 className="comments-title mb-3">
                                                <i className="fa fa-comments" style={{marginRight: '8px', color: '#ff8a00'}}></i>
                                                Müşteri Yorumları ({approvedComments.length + (product.all_comments ? Math.min(10 - approvedComments.length, product.all_comments.length) : 0)})
                                            </h5>
                                            <div className="comments-list">
                                                {/* Gerçek kullanıcı yorumları - EN ÜSTTE */}
                                                {(showAllComments ? approvedComments : approvedComments.slice(0, 3)).map((comment, index) => {
                                                    return (
                                                        <div key={comment.id || `real-${index}`} className="comment-item mb-3 p-3" style={{
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f9f9f9'
                                                        }}>
                                                            <div className="comment-header mb-2">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="user-avatar me-2" style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#ff8a00',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {(comment.userName || 'M').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                                            <strong className="comment-author" style={{ fontSize: '16px' }}>
                                                                                {comment.userName || 'Müşteri'}
                                                                            </strong>
                                                                            <span className="badge bg-success" style={{fontSize: '0.7rem'}}>Doğrulanmış</span>
                                                                            {comment.rating && (
                                                                                <div className="comment-rating" style={{
                                                                                    fontSize: '14px',
                                                                                    color: '#ff8a00',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '2px'
                                                                                }}>
                                                                                    {'★'.repeat(comment.rating)}
                                                                                    {'☆'.repeat(5 - comment.rating)}
                                                                                    <span style={{ marginLeft: '5px', fontSize: '12px', color: '#666' }}>
                                                                                        ({comment.rating}/5)
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="comment-date" style={{fontSize: '0.75rem', color: '#999'}}>
                                                                            {comment.createdAt || comment.approvedAt ? new Date(comment.createdAt || comment.approvedAt).toLocaleDateString('tr-TR', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            }) : ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="comment-text" style={{color: '#555', lineHeight: '1.6', marginTop: '8px'}}>
                                                                {comment.comment}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                
                                                {/* Placeholder yorumlar - Max 10 total (user comments + placeholders) */}
                                                {product.all_comments && product.all_comments.length > 0 && (
                                                    (showAllComments 
                                                        ? product.all_comments.slice(0, Math.max(0, 10 - approvedComments.length))
                                                        : product.all_comments.slice(0, Math.max(0, 3 - approvedComments.length))
                                                    ).map((comment, localIndex) => {
                                                        return (
                                                            <div key={`placeholder-${localIndex}`} className="comment-item mb-3 p-3" style={{
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#f9f9f9'
                                                            }}>
                                                                <div className="comment-header mb-2">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="user-avatar me-2" style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#6c757d',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#fff',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                            {String.fromCharCode(65 + (localIndex % 26))}
                                                                        </div>
                                                                        <div>
                                                                            <strong className="comment-author">Müşteri {localIndex + 1}</strong>
                                                                            <div className="comment-rating" style={{fontSize: '0.85rem', color: '#ff8a00', display: 'flex', alignItems: 'center', gap: '2px'}}>
                                                                                {'★'.repeat([5, 5, 4, 5, 4, 5, 5, 4, 5, 5][localIndex % 10])}
                                                                                {'☆'.repeat(5 - [5, 5, 4, 5, 4, 5, 5, 4, 5, 5][localIndex % 10])}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="comment-text" style={{color: '#555', lineHeight: '1.6'}}>
                                                                    {comment}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            
                                            {/* Tüm Yorumları Gör butonu */}
                                            {(approvedComments.length + (product.all_comments ? product.all_comments.length : 0)) > 3 && !showAllComments && (
                                                <div className="text-center mt-3">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => setShowAllComments(true)}
                                                        style={{
                                                            padding: '8px 20px',
                                                            borderRadius: '20px',
                                                            borderColor: '#ff8a00',
                                                            color: '#ff8a00'
                                                        }}
                                                    >
                                                        Tüm Yorumları Gör
                                                    </button>
                                                </div>
                                            )}
                                            {showAllComments && (
                                                <div className="text-center mt-3">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => setShowAllComments(false)}
                                                        style={{
                                                            padding: '8px 20px',
                                                            borderRadius: '20px',
                                                            borderColor: '#ff8a00',
                                                            color: '#ff8a00'
                                                        }}
                                                    >
                                                        Daha Az Göster
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
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