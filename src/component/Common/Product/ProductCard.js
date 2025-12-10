import React from 'react'
import { Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { incrementWhatsAppClick } from '../../../utils/whatsappTracker';

const ProductCard = (props) => {
    let dispatch = useDispatch();
    // Add to cart
    const addToCart = async (id) => {
        dispatch({ type: "products/addToCart", payload: { id } })
    }

    // WhatsApp tıklama sayısını artır
    const handleWhatsAppClick = (productId) => {
        incrementWhatsAppClick(productId);
    }
    return (
        <>
            <div className="product_wrappers_one">
                <div className="thumb">
                    <Link to={`/product-details-one/${props.data.id}`} className="image">
                        <img src={props.data.image || props.data.img || props.data.mainImage || (props.data.images && props.data.images[0])} alt={props.data.title} />
                        <img className="hover-image" src={(props.data.images && props.data.images[1]) || props.data.image || props.data.img || props.data.mainImage || (props.data.images && props.data.images[0])}
                            alt={props.data.title} />
                    </Link>
                    <span className="badges">
                        <span className="new">Yeni</span>
                        {props.data.stock > 0 && <span className="sale">Stokta</span>}
                    </span>
                    <div className="product-actions">
                        <a 
                            href={`https://wa.me/905393973949?text=Merhaba, ${props.data.title} ürünü hakkında bilgi almak istiyorum. Product ID: ${props.data.originalId || props.data.id} - Fiyat: ₺${props.data.price.toLocaleString()}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="whatsapp-btn-small"
                            title="WhatsApp ile İletişim"
                            onClick={() => handleWhatsAppClick(props.data.id)}
                        >
                            <i className="fab fa-whatsapp" style={{fontSize: '16px'}}></i>
                        </a>
                            <a 
                                href="tel:+905393973949" 
                                className="phone-btn-small"
                                title="Telefon Et"
                            >
                                <i className="fa fa-phone"></i>
                            </a>
                            <button 
                                onClick={() => addToCart(props.data.id)}
                                className="add-to-cart-btn-small"
                                title="Sepete Ekle"
                            >
                                <i className="fa fa-shopping-cart"></i>
                            </button>
                    </div>
                </div>
                <div className="content">
                    <h5 className="title">
                        <Link to={`/product-details-one/${props.data.id}`}>{props.data.title}</Link>
                    </h5>
                                    <div className="brand-info">
                                        <small className="text-muted">{props.data.brand}</small>
                                    </div>
                                    <div className="product-id-info">
                                        <small className="text-muted">Product ID: <strong>{props.data.originalId || props.data.id}</strong></small>
                                    </div>
                    <div className="rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => {
                                // Firebase'den gelen gerçek rating'i öncelikli kullan, yoksa eski rating'i kullan
                                // rating bir sayı olabilir veya { rate: number, count: number } objesi olabilir
                                let realRating = 0;
                                if (typeof props.data.rating === 'number') {
                                    realRating = props.data.rating;
                                } else if (props.data.rating && typeof props.data.rating === 'object' && props.data.rating.rate) {
                                    realRating = props.data.rating.rate;
                                } else if (props.data.rating !== undefined) {
                                    realRating = props.data.rating;
                                }
                                
                                return (
                                    <i key={i} className={`fa fa-star ${i < Math.floor(realRating) ? 'text-warning' : 'text-muted'}`}></i>
                                );
                            })}
                        </div>
                        <small className="text-muted">
                            ({props.data.ratingCount !== undefined ? props.data.ratingCount : (props.data.reviewCount || 0)})
                        </small>
                    </div>
                    <span className="price">
                        <span className="new">₺{props.data.price.toLocaleString()}</span>
                        {props.data.originalPrice && props.data.originalPrice !== props.data.price && (
                            <span className="old">₺{props.data.originalPrice.toLocaleString()}</span>
                        )}
                    </span>
                </div>
            </div>

        </>
    )
}

export default ProductCard