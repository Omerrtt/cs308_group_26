import React from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { updateCart, removeCart } from '../app/slices/products';

const Cart = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);
    const carts = useSelector((state) => state.products.carts);

    // Calculate totals
    const subtotal = carts.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    // Update quantity
    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(updateCart({ id, quantity: newQuantity }));
    };

    // Remove item
    const handleRemoveItem = (id) => {
        dispatch(removeCart({ id }));
    };
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

const Cart = () => {
    const dispatch = useDispatch();
    const carts = useSelector((state) => state.products.carts);

    // Calculate Subtotal
    const calculateSubtotal = () => {
        return carts.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 29.90 : 0; // Fixed shipping cost example
    const total = subtotal + shipping;

    // Remove item
    const removeCartItem = (id) => {
        dispatch({ type: "products/removeCart", payload: { id } });
        Swal.fire({
            icon: 'success',
            title: 'Sepetten Çıkarıldı',
            showConfirmButton: false,
            timer: 1500
        })
    }

    // Update quantity
    const updateQuantity = (id, val) => {
        if (val < 1) return;
        dispatch({ type: "products/updateCart", payload: { id, val } });
    }

    // Clear cart
    const clearCartItems = () => {
        dispatch({ type: "products/clearCart" });
        Swal.fire({
            icon: 'success',
            title: 'Sepet Temizlendi',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="cart-content">
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h3 className="mb-4 text-center">Sepetim</h3>
                                        
                                        {!status ? (
                                            // Login olmamış kullanıcı için
                                            <>
                                                {carts.length === 0 ? (
                                                    <div className="cart-items">
                                                        <div className="alert alert-info text-center">
                                                            <i className="fa fa-shopping-cart" style={{fontSize: '48px', marginBottom: '15px', display: 'block'}}></i>
                                                            <h5>Sepetiniz boş</h5>
                                                            <p className="mb-3">Sepetinizdeki diğer ürünleri görmek için giriş yapabilirsiniz.</p>
                                                            <Link 
                                                                to="/login"
                                                                className="theme-btn-one btn-black-overlay btn_md"
                                                            >
                                                                <i className="fa fa-sign-in" style={{marginRight: '8px'}}></i>
                                                                Giriş Yap
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="alert alert-warning text-center mb-4">
                                                            <i className="fa fa-lock" style={{fontSize: '32px', marginBottom: '10px', display: 'block', color: '#ff8a00'}}></i>
                                                            <h5>Checkout için Giriş Yapın</h5>
                                                            <p className="mb-3">Siparişinizi tamamlamak için lütfen giriş yapın.</p>
                                                            <Link 
                                                                to="/login"
                                                                className="theme-btn-one btn-black-overlay btn_md"
                                                            >
                                                                <i className="fa fa-sign-in" style={{marginRight: '8px'}}></i>
                                                                Giriş Yap
                                                            </Link>
                                                        </div>
                                                        <div className="cart-items">
                                                            <div className="table-responsive">
                                                                <table className="table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Ürün</th>
                                                                            <th>Fiyat</th>
                                                                            <th>Adet</th>
                                                                            <th>Toplam</th>
                                                                            <th>İşlem</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {carts.map((item) => {
                                                                            const itemPrice = parseFloat(item.price) || 0;
                                                                            const itemQuantity = item.quantity || 1;
                                                                            const itemTotal = itemPrice * itemQuantity;
                                                                            return (
                                                                                <tr key={item.id}>
                                                                                    <td>
                                                                                        <div className="d-flex align-items-center">
                                                                                            {item.img && (
                                                                                                <img 
                                                                                                    src={item.img} 
                                                                                                    alt={item.title}
                                                                                                    style={{width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px'}}
                                                                                                />
                                                                                            )}
                                                                                            <div>
                                                                                                <strong>{item.title}</strong>
                                                                                                {item.originalId && (
                                                                                                    <div><small className="text-muted">ID: {item.originalId}</small></div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>{itemPrice.toFixed(2)} ₺</td>
                                                                                    <td>
                                                                                        <div className="input-group" style={{width: '120px'}}>
                                                                                            <button 
                                                                                                className="btn btn-outline-secondary" 
                                                                                                type="button"
                                                                                                onClick={() => handleQuantityChange(item.id, itemQuantity - 1)}
                                                                                            >
                                                                                                -
                                                                                            </button>
                                                                                            <input 
                                                                                                type="number" 
                                                                                                className="form-control text-center" 
                                                                                                value={itemQuantity}
                                                                                                min="1"
                                                                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                                                            />
                                                                                            <button 
                                                                                                className="btn btn-outline-secondary" 
                                                                                                type="button"
                                                                                                onClick={() => handleQuantityChange(item.id, itemQuantity + 1)}
                                                                                            >
                                                                                                +
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td><strong>{itemTotal.toFixed(2)} ₺</strong></td>
                                                                                    <td>
                                                                                        <button 
                                                                                            className="btn btn-danger btn-sm"
                                                                                            onClick={() => handleRemoveItem(item.id)}
                                                                                        >
                                                                                            <i className="fa fa-trash"></i>
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <div className="cart-summary mt-4 p-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <h5>Sepet Özeti</h5>
                                                                </div>
                                                                <div className="col-md-6 text-right">
                                                                    <p className="mb-2">Ara Toplam: <strong>{subtotal.toFixed(2)} ₺</strong></p>
                                                                    <p className="mb-2">Kargo: <strong>Ücretsiz</strong></p>
                                                                    <hr />
                                                                    <h5>Toplam: <strong>{total.toFixed(2)} ₺</strong></h5>
                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-12 text-center">
                                                                    <Link 
                                                                        to="/login"
                                                                        className="theme-btn-one btn-black-overlay btn_md"
                                                                    >
                                                                        <i className="fa fa-sign-in" style={{marginRight: '8px'}}></i>
                                                                        Checkout için Giriş Yap
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : carts.length === 0 ? (
                                        <div className="cart-items">
                                            <div className="alert alert-info text-center">
                                                <i className="fa fa-shopping-cart" style={{fontSize: '48px', marginBottom: '15px', display: 'block'}}></i>
                                                    <h5>Sepetiniz boş</h5>
                                                    <p className="mb-0">Sepetinize ürün eklemek için alışverişe başlayın!</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="cart-items">
                                                    <div className="table-responsive">
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Ürün</th>
                                                                    <th>Fiyat</th>
                                                                    <th>Adet</th>
                                                                    <th>Toplam</th>
                                                                    <th>İşlem</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {carts.map((item) => {
                                                                    const itemPrice = parseFloat(item.price) || 0;
                                                                    const itemQuantity = item.quantity || 1;
                                                                    const itemTotal = itemPrice * itemQuantity;
                                                                    return (
                                                                        <tr key={item.id}>
                                                                            <td>
                                                                                <div className="d-flex align-items-center">
                                                                                    {item.img && (
                                                                                        <img 
                                                                                            src={item.img} 
                                                                                            alt={item.title}
                                                                                            style={{width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px'}}
                                                                                        />
                                                                                    )}
                                                                                    <div>
                                                                                        <strong>{item.title}</strong>
                                                                                        {item.originalId && (
                                                                                            <div><small className="text-muted">ID: {item.originalId}</small></div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>{itemPrice.toFixed(2)} ₺</td>
                                                                            <td>
                                                                                <div className="input-group" style={{width: '120px'}}>
                                                                                    <button 
                                                                                        className="btn btn-outline-secondary" 
                                                                                        type="button"
                                                                                        onClick={() => handleQuantityChange(item.id, itemQuantity - 1)}
                                                                                    >
                                                                                        -
                                                                                    </button>
                                                                                    <input 
                                                                                        type="number" 
                                                                                        className="form-control text-center" 
                                                                                        value={itemQuantity}
                                                                                        min="1"
                                                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                                                    />
                                                                                    <button 
                                                                                        className="btn btn-outline-secondary" 
                                                                                        type="button"
                                                                                        onClick={() => handleQuantityChange(item.id, itemQuantity + 1)}
                                                                                    >
                                                                                        +
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                            <td><strong>{itemTotal.toFixed(2)} ₺</strong></td>
                                                                            <td>
                                                                                <button 
                                                                                    className="btn btn-danger btn-sm"
                                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                                >
                                                                                    <i className="fa fa-trash"></i>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                            </div>
                                        </div>

                                        <div className="cart-summary mt-4 p-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                            <h5>Sepet Özeti</h5>
                                                </div>
                                                <div className="col-md-6 text-right">
                                                            <p className="mb-2">Ara Toplam: <strong>{subtotal.toFixed(2)} ₺</strong></p>
                                                            <p className="mb-2">Kargo: <strong>Ücretsiz</strong></p>
                                                    <hr />
                                                            <h5>Toplam: <strong>{total.toFixed(2)} ₺</strong></h5>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-12 text-center">
                                                    <Link 
                                                        to="/checkout"
                                                        className="theme-btn-one btn-black-overlay btn_md"
                                                    >
                                                                Ödemeye Geç
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                            </>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Alışveriş Sepetim</h3>
                                            {carts.length > 0 && (
                                                <button className="btn btn-danger btn-sm" onClick={clearCartItems}>
                                                    Sepeti Temizle
                                                </button>
                                            )}
                                        </div>

                                        <div className="cart-items">
                                            {carts.length === 0 ? (
                                                <div className="alert alert-info text-center">
                                                    <i className="fa fa-shopping-cart" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                                                    <h5>Sepetiniz boş</h5>
                                                    <p className="mb-0">Sepetinize ürün ekleyerek burada görebilirsiniz!</p>
                                                    <Link to="/shop" className="theme-btn-one btn-black-overlay btn_sm mt-3">
                                                        Alışverişe Başla
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="table-responsive">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>Ürün</th>
                                                                <th>Fiyat</th>
                                                                <th>Adet</th>
                                                                <th>Toplam</th>
                                                                <th>İşlem</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {carts.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img src={item.img || item.image} alt={item.title} style={{ width: '60px', marginRight: '15px' }} />
                                                                            <div>
                                                                                <h6 className="mb-0"><Link to={`/product-details-one/${item.id}`}>{item.title}</Link></h6>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>₺{item.price.toLocaleString()}</td>
                                                                    <td>
                                                                        <div className="input-group" style={{ width: '120px' }}>
                                                                            <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                                            <input type="text" className="form-control text-center" value={item.quantity} readOnly />
                                                                            <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                                        </div>
                                                                    </td>
                                                                    <td>₺{(item.price * item.quantity).toLocaleString()}</td>
                                                                    <td>
                                                                        <button className="btn btn-link text-danger" onClick={() => removeCartItem(item.id)}>
                                                                            <i className="fa fa-trash"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {carts.length > 0 && (
                                            <div className="cart-summary mt-4 p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <h5>Sepet Özeti</h5>
                                                    </div>
                                                    <div className="col-md-6 text-right">
                                                        <p className="mb-2">Ara Toplam: <strong>₺{subtotal.toLocaleString()}</strong></p>
                                                        <p className="mb-2">Kargo: <strong>₺{shipping.toLocaleString()}</strong></p>
                                                        <hr />
                                                        <h5>Toplam: <strong>₺{total.toLocaleString()}</strong></h5>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-12 text-center">
                                                        <Link
                                                            to="/checkout"
                                                            className="theme-btn-one btn-black-overlay btn_md"
                                                        >
                                                            Ödemeye Geç
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

export default Cart
