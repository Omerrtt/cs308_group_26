import { getCategoryTree } from '../../../app/data/productsData'

// Kategori ikonları mapping (Font Awesome 4 uyumlu)
const getCategoryIcon = (categoryName) => {
    const iconMap = {
        'TV, Ses ve Elektronik': 'fa-television', // TV ikonu
        'Küçük Elektrikli Ev Aletleri': 'fa-cutlery', // Mutfak aletleri
        'Sağlık ve Güzellik Cihazları': 'fa-heart', // Sağlık/kalp
        'Klimalar, Isıtma ve Hava Bakımı': 'fa-snowflake-o', // Klima/soğutma
        'Ev ve Bahçe': 'fa-home', // Ev
        'Otomotiv ve DIY': 'fa-wrench', // Araç/tamir
        'Hobiler ve Spor': 'fa-futbol-o', // Spor/oyun
        'Fotoğraf ve Video': 'fa-camera', // Kamera
        'Bebek Ürünleri': 'fa-child', // Çocuk
        'Hava Temizleyiciler': 'fa-leaf', // Hava/doğa
        'Bilgisayarlar ve Bilgisayar Aksesuarları': 'fa-laptop' // Bilgisayar
    }
    return iconMap[categoryName] || 'fa-folder-open'
}

// Kategorileri MenuData formatına çevir (alt kategoriler dahil)
const getCategoriesMenu = () => {
    const categoryTree = getCategoryTree()
    
    // Öncelikli kategoriler (belirli sırada)
    const priorityCategories = [
        'TV, Ses ve Elektronik',
        'Bilgisayarlar ve Bilgisayar Aksesuarları',
        'Fotoğraf ve Video',
        'Küçük Elektrikli Ev Aletleri'
    ]
    
    const categories = []
    const processedCategories = new Set()
    
    // Önce öncelikli kategorileri ekle
    priorityCategories.forEach(categoryName => {
        if (categoryTree[categoryName]) {
            const value = categoryTree[categoryName]
            const categoryItem = {
                name: categoryName,
                href: `/category/${value.slug}`,
                icon: getCategoryIcon(categoryName)
            }
            
            // Alt kategoriler varsa ekle
            if (value.subcategories && Object.keys(value.subcategories).length > 0) {
                categoryItem.children = []
                for (const [subKey, subValue] of Object.entries(value.subcategories)) {
                    categoryItem.children.push({
                        name: subKey,
                        href: `/category/${subValue.slug}`
                    })
                }
            }
            
            categories.push(categoryItem)
            processedCategories.add(categoryName)
        }
    })
    
    // Sonra diğer kategorileri ekle
    for (const [key, value] of Object.entries(categoryTree)) {
        if (!processedCategories.has(key)) {
            const categoryItem = {
                name: key,
                href: `/category/${value.slug}`,
                icon: getCategoryIcon(key)
            }
            
            // Alt kategoriler varsa ekle
            if (value.subcategories && Object.keys(value.subcategories).length > 0) {
                categoryItem.children = []
                for (const [subKey, subValue] of Object.entries(value.subcategories)) {
                    categoryItem.children.push({
                        name: subKey,
                        href: `/category/${subValue.slug}`
                    })
                }
            }
            
            categories.push(categoryItem)
        }
    }
    
    return categories
}

export const MenuData = [
    {
        name: "KATEGORİLER",
        children: getCategoriesMenu()
    },
    {
        name: "TÜM ÜRÜNLER",
        href: "/category/tum-urunler"
    },
    {
        name: "İLETİŞİM",
        href: "/contact"
    }
]
