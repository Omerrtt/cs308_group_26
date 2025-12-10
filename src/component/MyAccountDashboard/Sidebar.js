import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2';
import { auth } from '../../firebaseConfig';

const Sidebar = () => {
    const location = useLocation()
    const history = useHistory()
    let status = useSelector((state) => state.user.status);
    const logout = async () => {
        try {
            // Firebase auth state listener zaten logout ve clearCart yapacak
            await auth.signOut()
            
        Swal.fire({
            icon: 'success',
            title: 'Çıkış Başarılı',
            text: 'Teşekkürler'
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
    return (
        <>
            <div className="col-sm-12 col-md-12 col-lg-3">
                <div className="dashboard_tab_button">
                    <ul role="tablist" className="nav flex-column dashboard-list">
                        <li><Link to="/my-account" className={location.pathname === '/my-account'?'active':null}><i className="fa fa-tachometer"></i>Kontrol Paneli</Link></li>
                        <li> <Link to="/my-account/customer-order" className={location.pathname === '/my-account/customer-order'?'active':null}><i className="fa fa-cart-arrow-down"></i>Siparişler</Link></li>
                        <li><Link to="/my-account/customer-download" className={location.pathname === '/my-account/customer-download'?'active':null}><i className="fa fa-cloud-download"></i>İndirmeler</Link></li>
                        <li><Link to="/my-account/customer-address" className={location.pathname === '/my-account/customer-address'?'active':null}><i className="fa fa-map-marker"></i>Adresler</Link></li>
                        <li><Link to="/my-account/customer-account-details" className={location.pathname === '/my-account/customer-account-details'?'active':null}><i className="fa fa-user"></i>Hesap Detayları</Link></li>
                        {
                            status?<li><Link to="/#!" onClick={(e)=>{e.preventDefault();logout()}}><i className="fa fa-sign-out"></i>Çıkış Yap</Link></li>:null
                        }
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar
