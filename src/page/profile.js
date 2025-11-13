import React, { useEffect } from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const Profile = () => {
    const history = useHistory();
    const user = useSelector((state) => state.user.user);
    const status = useSelector((state) => state.user.status);

    // Redirect to login if user is not authenticated
    useEffect(() => {
        if (!status) {
            history.push('/login');
        }
    }, [status, history]);

    // If user is not authenticated, don't render anything
    if (!status) {
        return null;
    }

    return (
        <>
            <Header />
            <Banner title="Profile" />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="profile-content">
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h3 className="mb-4 text-center">My Profile</h3>
                                        
                                        <div className="profile-info mb-4">
                                            <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                <h5 className="mb-2">Username</h5>
                                                <p className="mb-0 text-muted">{user.name || 'N/A'}</p>
                                            </div>
                                            
                                            <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                <h5 className="mb-2">Email</h5>
                                                <p className="mb-0 text-muted">{user.email || 'N/A'}</p>
                                            </div>
                                            
                                            {user.registrationDate && (
                                                <div className="info-item mb-3 pb-3" style={{borderBottom: '1px solid #eee'}}>
                                                    <h5 className="mb-2">Registration Date</h5>
                                                    <p className="mb-0 text-muted">
                                                        {new Date(user.registrationDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="orders-section mt-5">
                                            <h4 className="mb-3">My Orders</h4>
                                            <div className="alert alert-info">
                                                <p className="mb-0">You don't have any orders yet.</p>
                                            </div>
                                        </div>
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

export default Profile

