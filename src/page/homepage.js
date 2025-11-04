import React, { useEffect } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';

const Homepage = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);

    // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
    useEffect(() => {
        if (!status) {
            history.push('/login');
        }
    }, [status, history]);

    // Logout fonksiyonu
    const handleLogout = () => {
        dispatch({ type: "user/logout" });
        Swal.fire({
            icon: 'success',
            title: 'Logout Successful',
            text: 'You have been logged out successfully'
        }).then(() => {
            history.push('/login');
        });
    }

    // Eğer kullanıcı giriş yapmamışsa hiçbir şey render etme
    if (!status) {
        return null;
    }

    return (
        <>
            <Header />
            <Banner title="Homepage" />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="homepage-content">
                                <h2>Login successful, this is homepage</h2>
                                <p className="lead">Welcome, {user.name || 'User'}!</p>
                                <p>Email: {user.email || 'N/A'}</p>
                                <div className="mt-4">
                                    <button 
                                        className="theme-btn-one btn-black-overlay btn_md" 
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
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

export default Homepage

