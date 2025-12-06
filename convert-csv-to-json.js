const fs = require('fs');
const csv = require('csv-parser');

// Ürün adından benzersiz 6 haneli kod oluştur
const generateProductCode = (productName) => {
    const cleanName = productName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');
    
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        const char = cleanName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const positiveHash = Math.abs(hash);
    const code = (positiveHash % 900000) + 100000;
    return code.toString();
};

// Kategori slug'ını oluştur
const createCategorySlug = (categoryPath) => {
    if (!categoryPath) return 'genel';
    
    // Kategori yolundan ana kategoriyi çıkar
    const mainCategory = categoryPath.split(' -> ')[0];
    
    // Ana kategorilere göre slug oluştur
    if (mainCategory.includes('Elektronik')) {
        // Alt kategorilere göre daha detaylı mapping
        if (categoryPath.includes('Bilgisayar') || categoryPath.includes('USB') || categoryPath.includes('Hub')) {
            return 'bilgisayar-aksesuarlari';
        } else if (categoryPath.includes('Kamera') || categoryPath.includes('Fotoğraf') || categoryPath.includes('Video')) {
            return 'kamera-fotograf';
        } else if (categoryPath.includes('Araç') || categoryPath.includes('Araba') || categoryPath.includes('Motosiklet') || categoryPath.includes('Bisiklet')) {
            return 'elektronik';
        } else if (categoryPath.includes('Telefon') || categoryPath.includes('Cep Telefonu') || categoryPath.includes('Şarj')) {
            return 'elektronik';
        } else if (categoryPath.includes('Ses') || categoryPath.includes('Kulaklık') || categoryPath.includes('Hoparlör')) {
            return 'elektronik';
        } else if (categoryPath.includes('Gaming') || categoryPath.includes('Oyun') || categoryPath.includes('Konsol')) {
            return 'oyun-ve-eğlence';
        } else {
            return 'elektronik';
        }
    } else if (mainCategory.includes('Ev') || mainCategory.includes('Mutfak')) {
        return 'ev-mutfak';
    } else if (mainCategory.includes('Spor') || mainCategory.includes('Açık Hava')) {
        return 'genel';
    } else if (mainCategory.includes('Giyim') || mainCategory.includes('Moda')) {
        return 'giyim-aksesuarlari';
    } else if (mainCategory.includes('Sağlık') || mainCategory.includes('Kişisel Bakım')) {
        return 'saglik-kisisel-bakim';
    } else if (mainCategory.includes('Kitap')) {
        return 'kitap';
    } else {
        return 'genel';
    }
};

// Fiyat hesapla
const calculatePrice = (usdPrice) => {
    const price = parseFloat(usdPrice) || 0;
    return Math.round((price * 50) * 5 + 5000);
};

// Marka adını temizle
const cleanBrandName = (brandString) => {
    if (!brandString) return 'Bilinmeyen Marka';
    
    // "Visit the XXXXXX Store" formatından sadece marka adını çıkar
    if (brandString.includes('Visit the') && brandString.includes('Store')) {
        const match = brandString.match(/Visit the (.+?) Store/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // "Brand: XXXXXX" formatından sadece marka adını çıkar
    if (brandString.includes('Brand:')) {
        const match = brandString.match(/Brand:\s*(.+)/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Eğer hiçbiri değilse, orijinal string'i döndür
    return brandString.trim();
};

// Ana görseli al
const getMainImage = (mainImageString) => {
    if (!mainImageString) return '';
    return mainImageString.trim();
};

// Görselleri parse et
const parseImages = (imagesString) => {
    if (!imagesString) return [];
    const images = imagesString.split(';').map(img => img.trim()).filter(img => img);
    return images;
};

const products = [];

fs.createReadStream('amazon_products.csv')
    .pipe(csv())
    .on('data', (row) => {
        // Marka adını temizle
        const brandName = cleanBrandName(row['Marka']);
        
        // Ürün adını al
        const originalTitle = row['Ürün Adı (TR)'] || row['Ürün Adı'] || 'Ürün Adı Yok';
        
        // Marka adını ürün adının başına ekle (eğer marka adı yoksa veya ürün adı zaten marka ile başlıyorsa ekleme)
        const titleWithBrand = brandName && brandName !== 'Bilinmeyen Marka' && 
                              !originalTitle.toLowerCase().startsWith(brandName.toLowerCase()) 
                              ? `${brandName} ${originalTitle}` 
                              : originalTitle;

        // Sadece gerekli alanları al
        const product = {
            id: products.length + 1,
            title: titleWithBrand,
            titleEn: row['Ürün Adı'] || '',
            asin: row['ASIN/Ürün Kodu'] || '',
            productCode: generateProductCode(originalTitle),
            category: createCategorySlug(row['Kategori (TR)'] || row['Kategori']),
            categoryPath: row['Kategori (TR)'] || row['Kategori'] || '',
            mainImage: getMainImage(row['Ana Görsel']),
            images: parseImages(row['Görseller']),
            brand: brandName,
            price: calculatePrice(row['Fiyat (USD)']),
            originalPrice: parseFloat(row['Fiyat (USD)']) || 0,
            description: row['Açıklama (TR)'] || row['Açıklama'] || '',
            amazonLink: row['Amazon Link'] || '',
            inStock: true,
            rating: 4.0 + Math.random() * 1.0, // 4.0-5.0 arası rastgele
            reviewCount: Math.floor(Math.random() * 500) + 50, // 50-550 arası rastgele
            whatsappClicks: 0, // WhatsApp tıklama sayısı
            specifications: {
                "Genel": {
                    "Marka": row['Marka'] || 'Bilinmeyen',
                    "Model": row['ASIN/Ürün Kodu'] || 'N/A',
                    "Renk": "Çeşitli"
                }
            }
        };
        
        products.push(product);
    })
    .on('end', () => {
        console.log(`Toplam ${products.length} ürün işlendi`);
        
        // JSON dosyasına yaz
        fs.writeFileSync('src/app/data/allProducts.json', JSON.stringify(products, null, 2));
        console.log('allProducts.json dosyası oluşturuldu');
        
        // Kategorileri say
        const categoryCount = {};
        products.forEach(product => {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });
        
        console.log('\nKategori dağılımı:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`${category}: ${count} ürün`);
        });
    })
    .on('error', (error) => {
        console.error('Hata:', error);
    });
