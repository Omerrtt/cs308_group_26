import React from 'react'
import Header from '../../component/Common/Header'
import Banner from '../../component/Common/Banner'
import RightSideBar from '../../component/Shop/RightSideBar'
import Footer from '../../component/Common/Footer'

const ShopRightSideBar = () => {
    return (
        <>
            <Header />
            <Banner title="Shop" />
            <RightSideBar />
            <Footer />
        </>
    )
}

export default ShopRightSideBar