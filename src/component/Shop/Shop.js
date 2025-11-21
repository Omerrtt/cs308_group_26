import React, { useState, useEffect } from 'react'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { useSelector } from "react-redux";
import { getProductsData } from '../../app/data/productsData';
import BabyHeading from '../BabyToys/Heading';
import { useLocation, useHistory } from 'react-router-dom';

const Shop = () => {
    const location = useLocation();
    const history = useHistory();
    const [allProducts, setAllProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('popularity')
    const [filterBy, setFilterBy] = useState('most-popular')
    const [searchQuery, setSearchQuery] = useState('')

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

    // Arama fonksiyonu - ürünleri isme ve açıklamaya göre filtrele
    const searchProducts = (products, query) => {
        if (!query || query.trim() === '') {
            return products
        }
        
        const searchTerm = query.toLowerCase().trim()
        
        return products.filter(product => {
            // Ürün adında ara
            const titleMatch = product.title && product.title.toLowerCase().includes(searchTerm)
            
            // Ürün açıklamasında ara
            const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm)
            
            // Ürün kategorisinde ara
            const categoryMatch = product.category && product.category.toLowerCase().includes(searchTerm)
            
            // Ürün markasında ara (varsa)
            const brandMatch = product.brand && product.brand.toLowerCase().includes(searchTerm)
            
            return titleMatch || descriptionMatch || categoryMatch || brandMatch
        })
    }

    // Sıralama değiştiğinde
    const handleSortChange = (sortType) => {
        setSortBy(sortType)
        // Eğer arama varsa, arama sonuçlarını sırala
        const productsToSort = searchQuery ? searchProducts(allProducts, searchQuery) : allProducts
        const sorted = sortProducts(productsToSort, sortType)
        setFilteredProducts(sorted)
    }

    // Filtre değiştiğinde
    const handleFilterChange = (filterType) => {
        setFilterBy(filterType)
        // Eğer arama varsa, arama sonuçlarını filtrele
        const productsToFilter = searchQuery ? searchProducts(allProducts, searchQuery) : allProducts
        const filtered = filterProducts(productsToFilter, filterType)
        setFilteredProducts(filtered)
    }

    // Arama temizle
    const clearSearch = () => {
        setSearchQuery('')
        history.push('/shop')
        setFilteredProducts(allProducts)
    }

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const products = getProductsData()
                setAllProducts(products)
                
                // URL'den arama parametresini al
                const params = new URLSearchParams(location.search)
                const search = params.get('search')
                
                if (search) {
                    setSearchQuery(search)
                    // Önce arama yap, sonra sırala
                    const searchedProducts = searchProducts(products, search)
                    const sortedProducts = sortProducts(searchedProducts, sortBy)
                    setFilteredProducts(sortedProducts)
                } else {
                    setSearchQuery('')
                    setFilteredProducts(products)
                }
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error)
                setAllProducts([])
                setFilteredProducts([])
            }
            setLoading(false)
        }

        fetchProducts()
    }, [location.search])

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
                    <BabyHeading heading={searchQuery ? `"${searchQuery}" için Arama Sonuçları` : "Tüm Ürünler"} />
                    
                    {/* Arama Bilgisi */}
                    {searchQuery && (
                        <div className="alert alert-info d-flex justify-content-between align-items-center" role="alert">
                            <div>
                                <strong>{filteredProducts.length}</strong> ürün bulundu: <strong>"{searchQuery}"</strong>
                            </div>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={clearSearch}
                            >
                                <i className="fa fa-times"></i> Aramayı Temizle
                            </button>
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

                    <div className="row">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((data, index) => (
                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={index}>
                                    <ProductCard data={data} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-warning text-center" role="alert">
                                    <h4>Ürün Bulunamadı</h4>
                                    <p>"{searchQuery}" için hiçbir ürün bulunamadı. Farklı bir arama terimi deneyin.</p>
                                    <button 
                                        className="btn btn-primary mt-3"
                                        onClick={clearSearch}
                                    >
                                        Tüm Ürünleri Görüntüle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Shop
