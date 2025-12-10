import React from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../component/Common/Header'
import ProductDetailsOne from '../../component/Common/ProductDetails/ProductDetails'
import Footer from '../../component/Common/Footer'
import ProductInfo from '../../component/Common/ProductDetails/ProductInfo'

const ProductDetails = () => {
    const { id } = useParams()
    
    return (
        <>
            <Header />
            <ProductDetailsOne />
            <ProductInfo productId={id} />
            <Footer />
        </>
    )
}

export default ProductDetails