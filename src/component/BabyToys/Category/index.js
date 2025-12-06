import React from 'react'
import BabyHeading from '../Heading'
import { Link } from 'react-router-dom'
import { getProductsByCategory, getProductsData } from '../../../app/data/productsData'

const Category = () => {
    // Header'daki kategorilerle eşleştir
    const categories = [
        {
            id: 0,
            name: 'Tüm Ürünler',
            slug: 'tum-urunler',
            icon: 'fas fa-th-large',
            color: '#6f42c1'
        },
        {
            id: 1,
            name: 'Bilgisayar Aksesuarları',
            slug: 'bilgisayar-aksesuarlari',
            icon: 'fas fa-laptop',
            color: '#007bff'
        },
        {
            id: 2,
            name: 'Kamera & Fotoğraf',
            slug: 'kamera-fotograf',
            icon: 'fas fa-camera',
            color: '#28a745'
        },
        {
            id: 3,
            name: 'Elektronik',
            slug: 'elektronik',
            icon: 'fas fa-microchip',
            color: '#dc3545'
        }
    ]

    // Her kategori için ürün sayısını al
    const getCategoryProductCount = (slug) => {
        if (slug === 'tum-urunler') {
            return getProductsData().length
        }
        return getProductsByCategory(slug).length
    }
    
    return (
        <>
            <section id="baby_shop_categories" className="pb-100">
                <div className="container">
                    <BabyHeading heading="Kategoriler" />
                    <div className="row">
                        {categories.map((category, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-6" key={category.id}>
                                <div className="baby_category_card">
                                    <Link to={`/category/${category.slug}`}>
                                        <div className="baby_cat_img">
                                            <div 
                                                className="category-icon"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                <i className={category.icon}></i>
                                            </div>
                                        </div>
                                        <div className="baby_cat_content">
                                            <h5>{category.name}</h5>
                                            <p>{getCategoryProductCount(category.slug)} Ürün</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Category