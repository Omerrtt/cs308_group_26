import React from 'react'
import { Link } from 'react-router-dom'
import avater from '../../../assets/img/common/avater.png'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2';

const TopHeader = () => {
    let dispatch = useDispatch();
    const history = useHistory()

    let status = useSelector((state) => state.user.status);
    let user = useSelector((state) => state.user.user);

    const logout = () => {
        Swal.fire({
            icon: 'success',
            title: 'Logout Sucessfull',
            text: 'Thank You'
        })
        dispatch({ type: "user/logout" })
        history.push("/login");
    }
    return (
        <>
            <section id="top_header">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-8 col-sm-12 col-12">
                            <div className="top_header_left">
                                <p>Yeni ürünlerimize göz atın. <Link to="/shop">Tüm ürünleri görüntüle</Link></p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                            <div className="top_header_right">
                                {
                                    !status ?
                                        <ul className="right_list_fix">
                                            <li><a href="https://wa.me/905393973949?text=Merhaba, sipariş takibi hakkında bilgi almak istiyorum." target="_blank" rel="noopener noreferrer"><i className="fa fa-truck"></i> Sipariş Takibi</a></li>
                                        </ul>
                                        :
                                        <ul className="right_list_fix">
                                            <li><a href="https://wa.me/905393973949?text=Merhaba, sipariş takibi hakkında bilgi almak istiyorum." target="_blank" rel="noopener noreferrer"><i className="fa fa-truck"></i> Sipariş Takibi</a></li>
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