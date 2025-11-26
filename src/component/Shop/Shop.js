import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { getProductsData } from '../../app/data/productsData';
import BabyHeading from '../BabyToys/Heading';
import { filterProductsBySearch } from '../../utils/productSearch'
const Shop = () => {
    const location = useLocation()
    const [allProducts, setAllProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('popularity')
    const [filterBy, setFilterBy] = useState('most-popular')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 50

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
    }

    // Filtre değiştiğinde
    const handleFilterChange = (filterType) => {
        setFilterBy(filterType)
    }

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const products = getProductsData()
                setAllProducts(products)
                setFilteredProducts(products)
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error)
                setAllProducts([])
                setFilteredProducts([])
            }
            setLoading(false)
        }

        fetchProducts()
    }, [])

    useEffect(() => {
        if (!allProducts.length) return
        const params = new URLSearchParams(location.search)
        const query = params.get('search') || ''
        setSearchQuery(query)

        let nextProducts = [...allProducts]

        if (query) {
            nextProducts = filterProductsBySearch(nextProducts, query)
        }

        nextProducts = filterProducts(nextProducts, filterBy)
        nextProducts = sortProducts(nextProducts, sortBy)

        setFilteredProducts(nextProducts)
        setCurrentPage(1)
    }, [location.search, allProducts, sortBy, filterBy])

    const totalPages = useMemo(() => {
        if (!filteredProducts.length) return 1
        return Math.ceil(filteredProducts.length / itemsPerPage)
    }, [filteredProducts.length])

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredProducts.slice(startIndex, endIndex)
    }, [filteredProducts, currentPage])

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return
        setCurrentPage(pageNumber)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null

        const pagesToShow = []
        const maxVisible = 5
        let start = Math.max(1, currentPage - 2)
        let end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pagesToShow.push(i)
        }

        return (
            <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        «
                    </button>
                </li>
                {pagesToShow.map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                            {page}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        »
                    </button>
                </li>
            </ul>
        )
    }

    if (loading) {
        return (
            <section id="shop_main_area" className="ptb-100">
                <div className="container">
                    <div className="text-center py-5">
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
            <section id="shop_main_area" className="ptb-100">
                <div className="container">
                    {/* Başlık */}
                    <BabyHeading heading={searchQuery ? `"${searchQuery}" Arama Sonuçları` : "Tüm Ürünler"} />
                    
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

                    <div className="row">
                        {paginatedProducts.map((data, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={data.id || index}>
                                <ProductCard data={data} />
                            </div>
                        ))}
                    </div>

                    <div className="row">
                        <div className="col-12 mt-4">
                            {renderPagination()}
                            <div className="text-center text-muted mt-2">
                                {filteredProducts.length > 0 && (
                                    <small>
                                        {((currentPage - 1) * itemsPerPage) + 1}
                                        -
                                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                                        {' '} / {filteredProducts.length} ürün gösteriliyor
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Shop
