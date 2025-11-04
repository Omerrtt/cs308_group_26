import React from 'react'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import LoginArea from '../component/Login'
import Footer from '../component/Common/Footer'

const Login = () => {
    return (
        <>
            <Header />
            <Banner title="Giriş Yap" />
            <LoginArea />
            <Footer />
        </>
    )
}

export default Login