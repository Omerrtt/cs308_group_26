import React, { useState, useEffect } from 'react'
import BabyHeading from '../Heading'
import { Link } from 'react-router-dom'
import { getProductsByCategory, getProductsData } from '../../../app/data/productsData'
import { db } from '../../../firebaseConfig'

const Category = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    // Kategori ikonları ve renkleri mapping
    const categoryConfig = {
        'Bilgisayarlar ve Bilgisayar Aksesuarları': {
            icon: 'fas fa-laptop',
            color: '#007bff'
        },
        'Kamera ve Fotoğraf': {
            icon: 'fas fa-camera',
            color: '#28a745'
        },
        'TV, Ses ve Elektronik': {
            icon: 'fas fa-tv',
            color: '#dc3545'
        },
        'Otomatik': {
            icon: 'fas fa-car',
            color: '#ffc107'
        },
        'Genel': {
            icon: 'fas fa-th-large',
            color: '#6f42c1'
        }
    }

    // Varsayılan ikon ve renk
    const getCategoryStyle = (categoryName) => {
        return categoryConfig[categoryName] || {
            icon: 'fas fa-microchip',
            color: '#17a2b8'
        }
    }

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true)
                
                // Tüm ürünleri al
                const allProducts = await getProductsData()
                const totalCount = allProducts ? allProducts.length : 0

                // Firebase'den ana kategorileri al
                const categoriesList = [];
                const categoriesSnapshot = await db.collection('categories').get();
                
                for (const mainCategoryDoc of categoriesSnapshot.docs) {
                    const mainCategoryData = mainCategoryDoc.data();
                    categoriesList.push({
                        name: mainCategoryData.name,
                        slug: mainCategoryData.slug
                    });
                }

                // Eğer Firebase'de kategori yoksa, fallback olarak boş array kullan
                let mainCategories = categoriesList;
                if (mainCategories.length === 0) {
                    console.warn('Firebase\'de kategori bulunamadı');
                    mainCategories = [];
                }

                // Her kategori için ürün sayısını hesapla
                const categoriesWithCount = await Promise.all(
                    mainCategories.map(async (cat, index) => {
                        const categoryProducts = await getProductsByCategory(cat.slug)
                        const count = categoryProducts ? categoryProducts.length : 0
                        const style = getCategoryStyle(cat.name)
                        
                        return {
                            id: index + 1,
                            name: cat.name,
                            slug: cat.slug,
                            count: count,
                            icon: style.icon,
                            color: style.color
                        }
                    })
                )

                // Sadece ürünü olan kategorileri göster (veya en az 1 ürünü olanları)
                const filteredCategories = categoriesWithCount.filter(cat => cat.count > 0)

                // "Tüm Ürünler" kategorisini başa ekle
                const allCategories = [
                    {
                        id: 0,
                        name: 'Tüm Ürünler',
                        slug: 'tum-urunler',
                        count: totalCount,
                        icon: 'fas fa-th-large',
                        color: '#6f42c1'
                    },
                    ...filteredCategories
                ]

                setCategories(allCategories)
            } catch (error) {
                console.error('❌ Category: Kategoriler yüklenirken hata:', error)
                // Hata durumunda varsayılan kategorileri göster
                setCategories([
                    {
                        id: 0,
                        name: 'Tüm Ürünler',
                        slug: 'tum-urunler',
                        count: 0,
                        icon: 'fas fa-th-large',
                        color: '#6f42c1'
                    }
                ])
            } finally {
                setLoading(false)
            }
        }

        loadCategories()
        
        // Storage event listener - yeni kategori eklendiğinde güncelle
        const handleStorageChange = (e) => {
            if (e.key === 'categories_updated') {
                loadCategories();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Custom event listener - aynı tab'da kategori eklendiğinde
        const handleCategoriesUpdate = () => {
            loadCategories();
        };
        
        window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
        };
    }, [])
    
    return (
        <>
            <section id="baby_shop_categories" className="pb-100">
                <div className="container">
                    <BabyHeading heading="Kategoriler" />
                    {loading ? (
                        <div className="text-center py-5">
                            <p>Kategoriler yükleniyor...</p>
                        </div>
                    ) : (
                    <div className="row">
                            {categories.map((category) => (
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
                                                <p>{category.count} Ürün</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default Category