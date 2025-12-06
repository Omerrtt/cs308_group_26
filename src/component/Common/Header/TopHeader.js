import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import avater from '../../../assets/img/common/avater.png'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2';
import { auth } from '../../../firebaseConfig';

const TopHeader = () => {
    const history = useHistory()
    const [searchTerm, setSearchTerm] = useState('');

    let status = useSelector((state) => state.user.status);
    let user = useSelector((state) => state.user.user);

    const logout = async () => {
        try {
            // Firebase auth state listener zaten logout ve clearCart yapacak
            await auth.signOut()
            
        Swal.fire({
            icon: 'success',
            title: 'Logout Sucessfull',
            text: 'Thank You'
        })
            
        history.push("/login");
        } catch (error) {
            console.error('Logout error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: 'Çıkış yapılırken bir hata oluştu'
            })
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (!trimmed) {
            Swal.fire({
                icon: 'info',
                title: 'Arama',
                text: 'Lütfen aramak istediğiniz ürünü yazın.'
            })
            return;
        }
        history.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }

    return (
        <>
            <section id="top_header">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-8 col-sm-12 col-12">
                            <div className="top_header_left">
                                <form 
                                    className="top-search-form" 
                                    onSubmit={handleSearchSubmit}
                                    style={{display: 'flex', gap: '10px', alignItems: 'center'}}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ürün ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="top-search-input"
                                        style={{
                                            flex: 1,
                                            borderRadius: '20px',
                                            border: '1px solid #ddd',
                                            padding: '8px 16px'
                                        }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="top-search-button"
                                        style={{
                                            borderRadius: '20px',
                                            padding: '8px 16px',
                                            border: 'none',
                                            backgroundColor: '#ff8a00',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fa fa-search"></i>
                                        Ara
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                            <div className="top_header_right">
                                {
                                    !status ?
                                        <ul className="right_list_fix">
                                            <li><Link to="/login"><i className="fa fa-user"></i> Giriş Yap</Link></li>
                                        </ul>
                                        :
                                        <ul className="right_list_fix">
                                            <li className="after_login"><img src={avater} alt="avater" /> {user.name || 'Jhon Doe'} <i className="fa fa-angle-down"></i>
                                                <ul className="custom_dropdown">
                                                    <li><Link to="/my-account"><i className="fa fa-tachometer"></i> Dashboard</Link></li>
                                                    <li><Link to="/my-account/customer-order"><i className="fa fa-cubes"></i> My Orders</Link></li>
                                                    <li><Link to="#!" onClick={() => { logout() }} ><i className="fa fa-sign-out"></i> Logout</Link></li>
                                                </ul>
                                            </li>
                                        </ul>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TopHeader