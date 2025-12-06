import React from 'react'
import Slider from '../component/Common/Slider'
import Category from '../component/BabyToys/Category'
import TrendingProducts from '../component/BabyToys/TrendingProducts'
import Footer from '../component/Common/Footer'
import Header from '../component/Common/Header'

const Home = () => {
    return (
        <>
            <Header />
            <Slider />
            <Category />
            <TrendingProducts />
            <Footer />
        </>
    )
}

export default Home