import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import ProductCard from '../Product/ProductCard'
import Filter from '../../Shop/Filter'
import { getProductsByCategory, getProductsData, getCategoryTree } from '../../../app/data/productsData'

const CategoryPage = () => {
    const { categorySlug } = useParams()
    const location = useLocation()
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [displayedProducts, setDisplayedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [subcategories, setSubcategories] = useState([])
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [sortBy, setSortBy] = useState('popularity')
    const [filterBy, setFilterBy] = useState('most-popular')
    const [itemsPerPage] = useState(50)
    const [currentPage, setCurrentPage] = useState(1)

    // Kategori slug'ından kategori adını bul
    const getCategoryName = (slug) => {
        if (slug === 'tum-urunler' || slug === 'all') {
            return 'Tüm Ürünler'
        }
        
        const categoryTree = getCategoryTree()
        for (const [mainCat, data] of Object.entries(categoryTree)) {
            if (data.slug === slug) {
                return mainCat
            }
            // Alt kategorileri kontrol et
            for (const [subCat, subData] of Object.entries(data.subcategories)) {
                if (subData.slug === slug) {
                    return subCat
                }
            }
        }
        return slug
    }

    // Sıralama fonksiyonları
    const sortProducts = (products, sortType) => {
        const sortedProducts = [...products]
        
        switch (sortType) {
            case 'popularity':
                return sortedProducts.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
            case 'newness':
                return sortedProducts.sort((a, b) => b.id - a.id)
            case 'price-low':
                return sortedProducts.sort((a, b) => a.price - b.price)
            case 'price-high':
                return sortedProducts.sort((a, b) => b.price - a.price)
            case 'name-asc':
                return sortedProducts.sort((a, b) => a.title.localeCompare(b.title))
            case 'name-desc':
                return sortedProducts.sort((a, b) => b.title.localeCompare(a.title))
            default:
                return sortedProducts
        }
    }

    // Filtreleme fonksiyonu
    const filterProducts = (products, filterType) => {
        switch (filterType) {
            case 'most-popular':
                return sortProducts(products, 'popularity')
            case 'best-seller':
                return sortProducts(products, 'popularity')
            case 'trending':
                return sortProducts(products, 'newness')
            case 'featured':
                return sortProducts(products, 'rating')
            default:
                return products
        }
    }

    // Sıralama değiştiğinde
    const handleSortChange = (sortType) => {
        setSortBy(sortType)
        const sorted = sortProducts(products, sortType)
        setFilteredProducts(sorted)
        setCurrentPage(1)
        setDisplayedProducts(sorted.slice(0, itemsPerPage))
    }

    // Filtre değiştiğinde
    const handleFilterChange = (filterType) => {
        setFilterBy(filterType)
        const filtered = filterProducts(products, filterType)
        setFilteredProducts(filtered)
        setCurrentPage(1)
        setDisplayedProducts(filtered.slice(0, itemsPerPage))
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

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                console.log('CategoryPage - categorySlug:', categorySlug)
                const urlParams = new URLSearchParams(location.search)
                const subcategoryParam = urlParams.get('subcategory')
                
                let categoryProducts
                let foundSubcategories = []
                
                if (categorySlug === 'tum-urunler' || categorySlug === 'all') {
                    // Tüm ürünleri getir
                    categoryProducts = getProductsData()
                    setCategoryName('Tüm Ürünler')
                    setFilteredProducts(categoryProducts)
                    setDisplayedProducts(categoryProducts.slice(0, itemsPerPage))
                } else {
                    // Belirli kategori ürünlerini getir
                    categoryProducts = getProductsByCategory(categorySlug)
                    console.log('CategoryPage - categoryProducts:', categoryProducts?.length || 0)
                    setCategoryName(getCategoryName(categorySlug))
                    
                    // Kategori ağacından alt kategorileri bul
                    const categoryTree = getCategoryTree()
                    for (const [mainCat, data] of Object.entries(categoryTree)) {
                        if (data.slug === categorySlug) {
                            foundSubcategories = Object.keys(data.subcategories).map(subCat => ({
                                name: subCat,
                                slug: data.subcategories[subCat].slug,
                                fullPaths: data.subcategories[subCat].full_paths
                            }))
                            break
                        }
                    }
                    
                    // Alt kategori seçilmişse filtrele
                    if (subcategoryParam && foundSubcategories.length > 0) {
                        const subcat = foundSubcategories.find(s => s.slug === subcategoryParam)
                        if (subcat) {
                            setSelectedSubcategory(subcat)
                            const filtered = categoryProducts.filter(product => {
                                const productCategory = product.category || ''
                                return subcat.fullPaths.includes(productCategory)
                            })
                            setFilteredProducts(filtered)
                            setDisplayedProducts(filtered.slice(0, itemsPerPage))
                        } else {
                            setFilteredProducts(categoryProducts)
                            setDisplayedProducts(categoryProducts.slice(0, itemsPerPage))
                        }
                    } else {
                        setFilteredProducts(categoryProducts)
                        setDisplayedProducts(categoryProducts.slice(0, itemsPerPage))
                    }
                }
                
                console.log('CategoryPage - Final categoryProducts:', categoryProducts?.length || 0)
                console.log('CategoryPage - categoryName:', categoryName || getCategoryName(categorySlug))
                
                setProducts(categoryProducts)
                setSubcategories(foundSubcategories)
                setCurrentPage(1)
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error)
                setProducts([])
                setFilteredProducts([])
                setDisplayedProducts([])
            }
            setLoading(false)
        }

        fetchProducts()
    }, [categorySlug, location.search, itemsPerPage])
    
    const handleSubcategoryClick = (subcategory) => {
        setSelectedSubcategory(subcategory)
        const filtered = products.filter(product => {
            const productCategory = product.category || ''
            return subcategory.fullPaths.includes(productCategory)
        })
        setFilteredProducts(filtered)
        setCurrentPage(1)
        setDisplayedProducts(filtered.slice(0, itemsPerPage))
        // URL'i güncelle
        const newUrl = `${location.pathname}?subcategory=${subcategory.slug}`
        window.history.pushState({}, '', newUrl)
    }

    if (loading) {
        return (
            <>
                <Header />
                <section className="ptb-100">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Yükleniyor...</span>
                            </div>
                            <p className="mt-3">Ürünler yükleniyor...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        )
    }

    console.log('CategoryPage Render - filteredProducts.length:', filteredProducts.length)
    console.log('CategoryPage Render - displayedProducts.length:', displayedProducts.length)
    console.log('CategoryPage Render - categoryName:', categoryName)

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb-5">
                                <h2>{categoryName} Kategorisi</h2>
                                <p>{filteredProducts.length} ürün bulundu</p>
                            </div>
                        </div>
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
                                                const newUrl = location.pathname
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

                    {/* Filter Bileşeni */}
                    <div className="row mb-4">
                        <div className="col-lg-6 col-md-12">
                            <div className="product_filter">
                                <div className="customs_selects">
                                    <select 
                                        name="filter" 
                                        className="customs_sel_box" 
                                        value={filterBy}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                    >
                                        <option value="most-popular">Most Popular</option>
                                        <option value="best-seller">Best Seller</option>
                                        <option value="trending">Trending</option>
                                        <option value="featured">Featured</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12">
                            <div className="product_shot">
                                <div className="product_shot_title">
                                    <p>Sort By:</p>
                                </div>
                                <div className="customs_selects">
                                    <select 
                                        name="sort" 
                                        className="customs_sel_box" 
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                    >
                                        <option value="popularity">Sort By Popularity</option>
                                        <option value="newness">Sort By Newness</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name-asc">Name: A to Z</option>
                                        <option value="name-desc">Name: Z to A</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="row">
                                {displayedProducts.map((product) => (
                                    <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                        <ProductCard data={product} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Loading More Indicator */}
                            {loadingMore && (
                                <div className="row mt-4">
                                    <div className="col-12 text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="sr-only">Yükleniyor...</span>
                                        </div>
                                        <p className="mt-2">Daha fazla ürün yükleniyor...</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Load More Button (alternatif) */}
                            {!loadingMore && displayedProducts.length < filteredProducts.length && (
                                <div className="row mt-4">
                                    <div className="col-12 text-center">
                                        <button
                                            className="btn btn-primary"
                                            onClick={loadMoreProducts}
                                        >
                                            Daha Fazla Yükle ({displayedProducts.length} / {filteredProducts.length})
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Tüm ürünler yüklendi mesajı */}
                            {displayedProducts.length >= filteredProducts.length && displayedProducts.length > itemsPerPage && (
                                <div className="row mt-4">
                                    <div className="col-12 text-center">
                                        <p className="text-muted">Tüm ürünler gösterildi ({filteredProducts.length} ürün)</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="text-center py-5">
                                    <h3>Bu kategoride ürün bulunamadı</h3>
                                    <p>Bu kategoride henüz ürün bulunmuyor.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    )
}

export default CategoryPage
