import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Header from '../../component/Common/Header'
import Banner from '../../component/Common/Banner'
import CategoryShop from '../../component/Shop/CategoryShop'
import InstgramSlider from '../../component/Common/Instagram'
import Footer from '../../component/Common/Footer'
import { findCategoryBySlug } from '../../app/data/categoriesData'

const CategoryPage = () => {
    const { categorySlug } = useParams()
    const location = useLocation()
    const [pageTitle, setPageTitle] = useState("Kategori Ürünleri")
    const [pageChanging, setPageChanging] = useState(false)
    
    useEffect(() => {
        setPageChanging(true)
        
        // URL'den kategori slug'ını al
        const urlParams = new URLSearchParams(location.search)
        const categoryParam = urlParams.get('category') || categorySlug
        
        if (categoryParam) {
            const category = findCategoryBySlug(categoryParam)
            if (category) {
                setPageTitle(`${category.name} Ürünleri`)
            } else {
                setPageTitle("Kategori Ürünleri")
            }
        } else {
            setPageTitle("Tüm Ürünler")
        }
        
        // Sayfa değişikliği animasyonu
        setTimeout(() => {
            setPageChanging(false)
        }, 300)
    }, [categorySlug, location.search])
    
    return (
        <>
            <Header />
            <div className={`page-transition ${pageChanging ? 'changing' : ''}`}>
                <Banner title={pageTitle} />
                <CategoryShop />
                <InstgramSlider />
            </div>
            <Footer />
        </>
    )
}

export default CategoryPage
