import React from "react";
import { Link } from 'react-router-dom'

import { useDispatch, useSelector } from "react-redux";
import img from '../../assets/img/common/empty-cart.png'

const Wishlist = () => {
    let dispatch = useDispatch();

    let favorites = useSelector((state) => state.products.favorites);
    
    const rmProduct = (id) => {
        dispatch({ type: "products/removeFav", payload: { id } });
    }

    // Add to cart
    const addToCart = async (id) => {
        dispatch({ type: "products/addToCart", payload: { id } })
        dispatch({ type: "products/removeFav", payload: { id } });
    }

    return (
        <>
          {favorites.length
                                                ?
            <section id="Wishlist_area" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="table_desc">
                                <div className="table_page table-responsive">
                                    <table>
                                            <thead>
                                                <tr>
                                                    <th className="product_remove">Kaldır</th>
                                                    <th className="product_thumb">Resim</th>
                                                    <th className="product_name">Ürün</th>
                                                    <th className="product-price">Fiyat</th>
                                                    <th className="product_stock">Stok Durumu</th>
                                                    <th className="product_addcart">Sepete Ekle</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {favorites.map((data, index) => {
                                                    const stock = typeof data.stock === 'number' ? data.stock : parseInt(data.stock || 0, 10);
                                                    const inStock = stock > 0;
                                                    
                                                    return (
                                                        <tr key={index}>
                                                        <td className="product_remove">
                                                            <i className="fa fa-trash text-danger" onClick={() => rmProduct(data.id)} style={{'cursor':'pointer'}}></i>
                                                        </td>
                                                        <td className="product_thumb">
                                                        <Link to={ `/product-details-one/${data.id}`}>
                                                                <img src={data.img} alt="img" />
                                                        </Link>
                                                        </td>
                                                        <td className="product_name">
                                                        <Link to={ `/product-details-one/${data.id}`}>
                                                            {data.title}
                                                        </Link>
                                                        </td>
                                                        <td className="product-price">${data.price}.00</td>
                                                        <td className="product_stock">
                                                                <h6>{inStock ? "Stokta" : "Stokta Yok"}</h6>
                                                            </td>
                                                            <td className="product_addcart">
                                                                <button 
                                                                    type="button" 
                                                                    className={`theme-btn-one btn-black-overlay btn_sm ${!inStock ? 'disabled' : ''}`} 
                                                                    onClick={() => inStock && addToCart(data.id)}
                                                                    disabled={!inStock}
                                                                    style={!inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    {inStock ? "Sepete Ekle" : "Stokta Yok"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                : <section id="empty_cart_area" className="ptb-100">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 offset-lg-3 col-md-6 offset-md-3 col-sm-12 col-12">
                                <div className="empaty_cart_area">
                                    <div className="empty-cart-icon mb-3">
                                        <i className="fa fa-heart-o" style={{ fontSize: '100px', color: '#ff8a00' }}></i>
                                    </div>
                                    <h2>İSTEK LİSTENİZ BOŞ</h2>
                                    <h3>Üzgünüz... İstek listenizde ürün bulunamadı!</h3>
                                    <Link to="/shop" className="btn btn-black-overlay btn_sm">Alışverişe Devam Et</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    )
}

export default Wishlist
