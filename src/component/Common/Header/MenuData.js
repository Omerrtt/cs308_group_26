import { db } from '../../../firebaseConfig'

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

// Firebase'den kategorileri yükle ve MenuData formatına çevir
let cachedMenuCategories = null;
let isLoadingMenuCategories = false;

export const getCategoriesMenuFromFirebase = async () => {
    // Cache varsa direkt dön
    if (cachedMenuCategories) {
        return cachedMenuCategories;
    }
    
    // Zaten yükleniyorsa bekle
    if (isLoadingMenuCategories) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (cachedMenuCategories) {
                    clearInterval(checkInterval);
                    resolve(cachedMenuCategories);
                }
            }, 100);
        });
    }
    
    isLoadingMenuCategories = true;
    
    try {
        const categories = [];
        const categoriesSnapshot = await db.collection('categories').get();
        
        for (const mainCategoryDoc of categoriesSnapshot.docs) {
            const mainCategoryData = mainCategoryDoc.data();
            
            const categoryItem = {
                name: mainCategoryData.name,
                href: `/category/${mainCategoryData.slug}`,
                icon: getCategoryIcon(mainCategoryData.name)
            };
            
            // Alt kategorileri yükle
            const subcategoriesSnapshot = await mainCategoryDoc.ref.collection('subcategories').get();
            
            if (!subcategoriesSnapshot.empty) {
                categoryItem.children = [];
                subcategoriesSnapshot.forEach((subCategoryDoc) => {
                    const subCategoryData = subCategoryDoc.data();
                    categoryItem.children.push({
                        name: subCategoryData.name,
                        href: `/category/${subCategoryData.slug}`
                    });
                });
            }
            
            categories.push(categoryItem);
        }
        
        cachedMenuCategories = categories;
        isLoadingMenuCategories = false;
        return categories;
    } catch (error) {
        console.error('Firebase\'den kategori yükleme hatası:', error);
        isLoadingMenuCategories = false;
        // Fallback: boş array dön
        return [];
    }
};

// Cache'i temizle (yeni kategori eklendiğinde kullanılır)
export const clearMenuCategoriesCache = () => {
    cachedMenuCategories = null;
    isLoadingMenuCategories = false;
};

// Kategorileri MenuData formatına çevir (Firebase'den)
export const getCategoriesMenu = async () => {
    return await getCategoriesMenuFromFirebase();
}

// MenuData'yı dinamik olarak oluştur (React component için)
export const getMenuData = async () => {
    const categories = await getCategoriesMenu();
    
    return [
        {
            name: "KATEGORİLER",
            children: categories
        },
        {
            name: "TÜM ÜRÜNLER",
            href: "/category/tum-urunler"
        },
        {
            name: "İLETİŞİM",
            href: "/contact"
        }
    ];
}

// Varsayılan MenuData (fallback için)
export const MenuData = [
    {
        name: "KATEGORİLER",
        children: []
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
