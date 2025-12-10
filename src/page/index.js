import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Slider from '../component/Common/Slider'
import Category from '../component/BabyToys/Category'
import TrendingProducts from '../component/BabyToys/TrendingProducts'
import Footer from '../component/Common/Footer'
import Header from '../component/Common/Header'
import { auth } from '../firebaseConfig'

// Admin UID - Same as in admin panel
const ADMIN_UID = 'kcopWa6L3AZ5BbeHCokV7uKD6Pd2';

const Home = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if current user is admin
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser && currentUser.uid === ADMIN_UID) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });

        // Cleanup
        return () => unsubscribe();
    }, []);

    return (
        <>
            <Header />
            {isAdmin && (
                <div style={{
                    position: 'fixed',
                    top: '60px',
                    right: '20px',
                    zIndex: 9999,
                    backgroundColor: '#007bff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '12px 20px',
                    transition: 'all 0.3s ease'
                }}>
                    <Link 
                        to="/admin" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        <i className="fa fa-cog" style={{ fontSize: '18px' }}></i>
                        <span>Admin Panel</span>
                    </Link>
                </div>
            )}
            <Slider />
            <Category />
            <TrendingProducts />
            <Footer />
        </>
    )
}

export default Home