import React from 'react'
import ProductCard from '../Product/ProductCard'
import { useSelector } from "react-redux";
import Heading from '../../Fashion/Heading'
import { getProductsData } from '../../../app/data/productsData'

const RelatedProduct = () => {
    // Redux'tan ürünleri al
    let products = useSelector((state) => state.products.products);
    
    // Eğer Redux'ta ürün yoksa, doğrudan veri dosyasından al
    if (!products || products.length === 0) {
        products = getProductsData();
    }
    
    // Random 5 ürün seç
    const getRandomProducts = (allProducts, count = 5) => {
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    
    const randomProducts = getRandomProducts(products, 5);
    
    return (
        <>
            <section id="related_product" className="pb-100">
                <div className="container">
                    <Heading heading="Beğenebileceğiniz Diğer Ürünler" para="Size özel seçilmiş ürünler" />
                    <div className="row">
                        {randomProducts.map((data, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={index} >
                                <ProductCard data={data} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default RelatedProduct