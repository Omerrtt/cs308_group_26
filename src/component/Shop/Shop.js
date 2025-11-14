import React, { useState, useEffect } from 'react'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { useSelector } from "react-redux";
import { getProductsData } from '../../app/data/productsData';
import BabyHeading from '../BabyToys/Heading';
const Shop = () => {
    const [allProducts, setAllProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('popularity')
    const [filterBy, setFilterBy] = useState('most-popular')

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
        const sorted = sortProducts(allProducts, sortType)
        setFilteredProducts(sorted)
    }

    // Filtre değiştiğinde
    const handleFilterChange = (filterType) => {
        setFilterBy(filterType)
        const filtered = filterProducts(allProducts, filterType)
        setFilteredProducts(filtered)
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
                    <BabyHeading heading="Tüm Ürünler" />
                    
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
                        {filteredProducts.map((data, index) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={index}>
                                <ProductCard data={data} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Shop
