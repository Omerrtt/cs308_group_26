// WhatsApp tıklama sayısını takip etmek için utility fonksiyonları

const WHATSAPP_CLICKS_KEY = 'whatsapp_clicks';

// Local storage'dan tıklama sayılarını al
export const getWhatsAppClicks = () => {
    try {
        const clicks = localStorage.getItem(WHATSAPP_CLICKS_KEY);
        return clicks ? JSON.parse(clicks) : {};
    } catch (error) {
        console.error('WhatsApp tıklama sayıları alınırken hata:', error);
        return {};
    }
};

// Local storage'a tıklama sayılarını kaydet
export const saveWhatsAppClicks = (clicks) => {
    try {
        localStorage.setItem(WHATSAPP_CLICKS_KEY, JSON.stringify(clicks));
    } catch (error) {
        console.error('WhatsApp tıklama sayıları kaydedilirken hata:', error);
    }
};

// Belirli bir ürün için tıklama sayısını artır
export const incrementWhatsAppClick = (productId) => {
    const clicks = getWhatsAppClicks();
    clicks[productId] = (clicks[productId] || 0) + 1;
    saveWhatsAppClicks(clicks);
    return clicks[productId];
};

// Belirli bir ürün için tıklama sayısını al
export const getProductWhatsAppClicks = (productId) => {
    const clicks = getWhatsAppClicks();
    return clicks[productId] || 0;
};

// Tüm ürünler için tıklama sayılarını güncelle
export const updateProductsWithWhatsAppClicks = (products) => {
    const clicks = getWhatsAppClicks();
    return products.map(product => ({
        ...product,
        whatsappClicks: clicks[product.id] || 0
    }));
};
