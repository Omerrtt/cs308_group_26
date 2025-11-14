import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import BabyHeading from '../Heading'
import { getProductsData } from '../../../app/data/productsData'
import ProductCard from '../../Common/Product/ProductCard'

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([])
    const [allAvailableProducts, setAllAvailableProducts] = useState([])
    const [displayedCount, setDisplayedCount] = useState(12)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            // En çok yorumlanan 100 ürünü al
            const allProducts = getProductsData()
            console.log('Toplam ürün sayısı:', allProducts.length)
            console.log('İlk ürün:', allProducts[0])
            
            if (!allProducts || allProducts.length === 0) {
                console.log('Ürün bulunamadı!')
                setLoading(false)
                return
            }
            
            // Yorum sayısına göre sırala (en yüksekten en düşüğe) - yeni array oluştur
            const sortedByReviews = [...allProducts].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
            
            // En çok yorumlanan 100 ürünü al
            const top100Products = sortedByReviews.slice(0, Math.min(100, allProducts.length))
            
            // Random karıştır
            const shuffled = [...top100Products].sort(() => 0.5 - Math.random())
            
            console.log('Kullanılabilir ürün sayısı:', shuffled.length)
            setAllAvailableProducts(shuffled)
            
            // İlk 12 ürünü göster
            const initialProducts = shuffled.slice(0, Math.min(12, shuffled.length))
            setTrendingProducts(initialProducts)
            setLoading(false)
        } catch (error) {
            console.error('TrendingProducts hatası:', error)
            setLoading(false)
        }
    }, [])

    const loadMoreProducts = () => {
        const newCount = displayedCount + 12
        const newProducts = allAvailableProducts.slice(0, Math.min(newCount, allAvailableProducts.length))
        setTrendingProducts(newProducts)
        setDisplayedCount(newCount)
    }

    if (loading) {
        return (
            <section id="baby_trending_product" className="ptb-100">
                <div className="container">
                    <BabyHeading heading="Popüler Ürünler" />
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Yükleniyor...</span>
                        </div>
                        <p className="mt-3">Ürünler yükleniyor...</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section id="baby_trending_product" className="ptb-100">
                <div className="container">
                    <BabyHeading heading="Popüler Ürünler" />
                    <div className="row">
                        {trendingProducts.length > 0 ? (
                            trendingProducts.map((product, index) => (
                                <div className="col-lg-3 col-md-4 col-sm-6" key={product.id}>
                                    <ProductCard data={product} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <p>Henüz ürün bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Butonlar */}
                    <div className="text-center mt-4">
                        {displayedCount < allAvailableProducts.length && (
                            <button 
                                className="btn btn-outline-primary me-4"
                                onClick={loadMoreProducts}
                            >
                                Daha Fazla Ürün Göster
                            </button>
                        )}
                        
                        <Link 
                            to="/shop" 
                            className="btn btn-primary"
                        >
                            Tüm Ürünleri Göster
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TrendingProducts