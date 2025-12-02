import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../component/Common/Header'
import LoginArea from '../component/Login'
import Footer from '../component/Common/Footer'
import { store } from '../app/store'

const Login = () => {
    const history = useHistory()
    const status = useSelector((state) => state.user.status)

    useEffect(() => {
        // localStorage'dan da kontrol et (hızlı yanıt için)
        const storedAuth = JSON.parse(localStorage.getItem('cs308_auth_state') || 'null')
        const hasStoredAuth = storedAuth && storedAuth.status && storedAuth.timestamp && (Date.now() - storedAuth.timestamp < 24 * 60 * 60 * 1000)
        
        // Eğer Redux'ta veya localStorage'da auth varsa, ana sayfaya yönlendir
        if (status || hasStoredAuth) {
            history.push('/')
        }
    }, [status, history])

    return (
        <>
            <Header />
            <LoginArea />
            <Footer />
        </>
    )
}

export default Login