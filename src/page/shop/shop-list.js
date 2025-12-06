import React from 'react'
import Header from '../../component/Common/Header'
import Banner from '../../component/Common/Banner'
import ShopLists from '../../component/Shop/ShopList'
import Footer from '../../component/Common/Footer'

const ShopList = () => {
    return (
        <>
            <Header />
            <Banner title="Shop" />
            <ShopLists />
            <Footer />
        </>
    )
}

export default ShopList