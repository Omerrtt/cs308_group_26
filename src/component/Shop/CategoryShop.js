import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { useSelector } from "react-redux"
import { getProductsByCategory, getCategoryTree, getMainCategories } from '../../app/data/productsData'

const CategoryShop = () => {
    const { categorySlug } = useParams()
    const location = useLocation()
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [displayedProducts, setDisplayedProducts] = useState([])
    const [page, setPage] = useState(1)
    const [category, setCategory] = useState(null)
    const [subcategories, setSubcategories] = useState([])
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [breadcrumb, setBreadcrumb] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [filtering, setFiltering] = useState(false)
    const [categoryChanging, setCategoryChanging] = useState(false)
    const [previousCategory, setPreviousCategory] = useState(null)
    const [itemsPerPage] = useState(50)
    const [currentPage, setCurrentPage] = useState(1)
    
    // Tüm ürünleri al
    let allProducts = useSelector((state) => state.products.products)
    
    useEffect(() => {
        setLoading(true)
        setCategoryChanging(true)
        
        // URL'den kategori slug'ını al
        const urlParams = new URLSearchParams(location.search)
        const categoryParam = urlParams.get('category') || categorySlug
        const subcategoryParam = urlParams.get('subcategory')
        
        // Önceki kategoriyi kaydet
        if (category && category.slug !== categoryParam) {
            setPreviousCategory(category)
        }
        
        // Simüle edilmiş loading delay
        setTimeout(() => {
            if (categoryParam) {
                // Kategori ağacından kategoriyi bul
                const categoryTree = getCategoryTree()
                let foundCategory = null
                let foundSubcategories = []
                
                for (const [mainCat, data] of Object.entries(categoryTree)) {
                    if (data.slug === categoryParam || mainCat === categoryParam) {
                        foundCategory = {
                            name: mainCat,
                            slug: data.slug
                        }
                        // Alt kategorileri al
                        foundSubcategories = Object.keys(data.subcategories).map(subCat => ({
                            name: subCat,
                            slug: data.subcategories[subCat].slug,
                            fullPaths: data.subcategories[subCat].full_paths
                        }))
                        break
                    }
                }
                
                if (foundCategory) {
                    setCategory(foundCategory)
                    setSubcategories(foundSubcategories)
                    
                    // Breadcrumb oluştur
                    setBreadcrumb([
                        { name: 'Ana Sayfa', slug: '/' },
                        { name: foundCategory.name, slug: foundCategory.slug }
                    ])
                    
                    // Alt kategori seçilmişse
                    if (subcategoryParam) {
                        const subcat = foundSubcategories.find(s => s.slug === subcategoryParam)
                        if (subcat) {
                            setSelectedSubcategory(subcat)
                            const categoryProducts = getProductsByCategory(categoryParam)
                            setProducts(categoryProducts)
                            const filtered = categoryProducts.filter(product => {
                                const productCategory = product.category || ''
                                return subcat.fullPaths.includes(productCategory)
                            })
                            setFilteredProducts(filtered)
                            setCurrentPage(1)
                            setDisplayedProducts(filtered.slice(0, itemsPerPage))
                        } else {
                            filterProductsByCategory(categoryParam)
                        }
                    } else {
                        setSelectedSubcategory(null)
                        filterProductsByCategory(categoryParam)
                    }
                } else {
                    // Kategori bulunamadı
                    setProducts([])
                    setFilteredProducts([])
                }
            } else {
                // Tüm ürünleri göster
                setProducts(allProducts)
                setFilteredProducts(allProducts)
                setCurrentPage(1)
                setDisplayedProducts(allProducts.slice(0, itemsPerPage))
                setCategory({ name: "Tüm Ürünler", slug: "all" })
                setSubcategories([])
            }
            setLoading(false)
            
            // Kategori değişikliği animasyonunu bitir
            setTimeout(() => {
                setCategoryChanging(false)
                setPreviousCategory(null)
            }, 300)
        }, 500)
    }, [categorySlug, location.search, allProducts])
    
    const filterProductsByCategory = (categorySlug) => {
        // Gerçek ürün verilerini kullan
        const filteredProducts = getProductsByCategory(categorySlug)
        setProducts(filteredProducts)
        setFilteredProducts(filteredProducts)
        setCurrentPage(1)
        setDisplayedProducts(filteredProducts.slice(0, itemsPerPage))
    }
    
    const filterProductsBySubcategory = (fullPaths) => {
        const filtered = products.filter(product => {
            const productCategory = product.category || ''
            return fullPaths.includes(productCategory)
        })
        setFilteredProducts(filtered)
        setCurrentPage(1)
        setDisplayedProducts(filtered.slice(0, itemsPerPage))
    }
    
    const handleSubcategoryClick = (subcategory) => {
        setSelectedSubcategory(subcategory)
        filterProductsBySubcategory(subcategory.fullPaths)
        // URL'i güncelle
        const newUrl = `${location.pathname}?category=${category.slug}&subcategory=${subcategory.slug}`
        window.history.pushState({}, '', newUrl)
    }
    
    // Infinite scroll için daha fazla ürün yükle
    const loadMoreProducts = useCallback(() => {
        if (loadingMore || displayedProducts.length >= filteredProducts.length) {
            return
        }
        
        setLoadingMore(true)
        setTimeout(() => {
            setCurrentPage(prevPage => {
                const nextPage = prevPage + 1
                const startIndex = prevPage * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                const newProducts = filteredProducts.slice(startIndex, endIndex)
                
                setDisplayedProducts(prev => [...prev, ...newProducts])
                setLoadingMore(false)
                return nextPage
            })
        }, 300)
    }, [loadingMore, displayedProducts.length, filteredProducts, itemsPerPage])
    
    // Scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            if (loadingMore || displayedProducts.length >= filteredProducts.length) {
                return
            }
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            
            // Sayfa sonuna 200px kala yükle
            if (scrollTop + windowHeight >= documentHeight - 200) {
                loadMoreProducts()
            }
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [displayedProducts.length, filteredProducts.length, loadingMore, loadMoreProducts])
    
    const randProduct = (page) => {
        if (page) {
            setFiltering(true)
            setTimeout(() => {
                let data = [...products].sort((a, b) => 0.5 - Math.random())
                setProducts(data)
                setPage(page)
                setFiltering(false)
            }, 300)
        }
    }
    
    return (
        <>
            <section id="shop_main_area" className="ptb-100">
                <div className="container">
                    {/* Breadcrumb */}
                    {breadcrumb.length > 0 && (
                        <nav aria-label="breadcrumb" className={`mb-4 ${categoryChanging ? 'updating' : ''}`}>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/">Ana Sayfa</a>
                                </li>
                                {breadcrumb.map((item, index) => (
                                    <li key={index} className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}>
                                        {index === breadcrumb.length - 1 ? (
                                            item.name
                                        ) : (
                                            <a href={`/shop?category=${item.slug}`}>{item.name}</a>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                    
                    {/* Kategori Başlığı */}
                    <div className={`category-header mb-4 ${categoryChanging ? 'changing' : ''}`}>
                        <h1 className={`category-title ${categoryChanging ? 'changing' : ''}`}>
                            {category ? category.name : 'Ürünler'}
                        </h1>
                        <p className={`category-description ${categoryChanging ? 'updating' : ''}`}>
                            {category ? `${category.name} kategorisindeki ${filteredProducts.length} ürün` : `${filteredProducts.length} ürün bulundu`}
                        </p>
                        {categoryChanging && previousCategory && (
                            <div className="category-transition-indicator">
                                <small className="text-muted">
                                    {previousCategory.name} → {category ? category.name : 'Tüm Ürünler'}
                                </small>
                            </div>
                        )}
                    </div>
                    
                    {/* Alt Kategori Filtreleri */}
                    {subcategories.length > 0 && (
                        <div className="subcategory-filters mb-4">
                            <div className="row">
                                <div className="col-12">
                                    <h4 className="mb-3">Alt Kategoriler:</h4>
                                    <div className="subcategory-buttons">
                                        <button
                                            className={`btn ${selectedSubcategory === null ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                                            onClick={() => {
                                                setSelectedSubcategory(null)
                                                setFilteredProducts(products)
                                                setCurrentPage(1)
                                                setDisplayedProducts(products.slice(0, itemsPerPage))
                                                const newUrl = `${location.pathname}?category=${category.slug}`
                                                window.history.pushState({}, '', newUrl)
                                            }}
                                        >
                                            Tümü ({products.length})
                                        </button>
                                        {subcategories.map((subcat, index) => (
                                            <button
                                                key={index}
                                                className={`btn ${selectedSubcategory?.slug === subcat.slug ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                                                onClick={() => handleSubcategoryClick(subcat)}
                                            >
                                                {subcat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <Filter filterEvent={randProduct}/>
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="loading-container text-center py-5">
                            <div className="loading-spinner">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Yükleniyor...</span>
                                </div>
                            </div>
                            <p className="loading-text mt-3">Ürünler yükleniyor...</p>
                        </div>
                    )}
                    
                    {/* Products Grid */}
                    <div className={`products-grid ${loading ? 'loading' : ''} ${filtering ? 'filtering' : ''}`}>
                        <div className="row">
                            {!loading && filteredProducts.length > 0 ? (
                                <>
                                    {displayedProducts.map((data, index) => (
                                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 product-item" key={data.id || index}>
                                            <ProductCard data={data} />
                                        </div>
                                    ))}
                                    
                                    {/* Loading More Indicator */}
                                    {loadingMore && (
                                        <div className="col-12 text-center mt-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="sr-only">Yükleniyor...</span>
                                            </div>
                                            <p className="mt-2">Daha fazla ürün yükleniyor...</p>
                                        </div>
                                    )}
                                    
                                    {/* Load More Button (alternatif) */}
                                    {!loadingMore && displayedProducts.length < filteredProducts.length && (
                                        <div className="col-12 text-center mt-4">
                                            <button
                                                className="btn btn-primary"
                                                onClick={loadMoreProducts}
                                            >
                                                Daha Fazla Yükle ({displayedProducts.length} / {filteredProducts.length})
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Tüm ürünler yüklendi mesajı */}
                                    {displayedProducts.length >= filteredProducts.length && displayedProducts.length > itemsPerPage && (
                                        <div className="col-12 text-center mt-4">
                                            <p className="text-muted">Tüm ürünler gösterildi ({filteredProducts.length} ürün)</p>
                                        </div>
                                    )}
                                </>
                            ) : !loading && filteredProducts.length === 0 ? (
                                <div className="col-12">
                                    <div className="no-products text-center py-5">
                                        <h3>Bu kategoride ürün bulunamadı</h3>
                                        <p>Farklı bir kategori seçmeyi deneyin.</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    
                    {/* Pagination */}
                    {!loading && filteredProducts.length > 0 && (
                        <div className="col-lg-12">
                            <ul className="pagination">
                                <li className="page-item" onClick={(e) => { randProduct(page > 1 ? page - 1 : 0) }}>
                                    <a className="page-link" href="#!" aria-label="Previous">
                                        <span aria-hidden="true">«</span>
                                    </a>
                                </li>
                                <li className={"page-item " + (page === 1 ? "active" : null)} onClick={(e) => { randProduct(1) }}>
                                    <a className="page-link" href="#!">1</a>
                                </li>
                                <li className={"page-item " + (page === 2 ? "active" : null)} onClick={(e) => { randProduct(2) }}>
                                    <a className="page-link" href="#!">2</a>
                                </li>
                                <li className={"page-item " + (page === 3 ? "active" : null)} onClick={(e) => { randProduct(3) }}>
                                    <a className="page-link" href="#!">3</a>
                                </li>
                                <li className="page-item" onClick={(e) => { randProduct(page < 3 ? page + 1 : 0) }}>
                                    <a className="page-link" href="#!" aria-label="Next">
                                        <span aria-hidden="true">»</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default CategoryShop
