// Malikanelectronics Kategori Verileri
import CatImg1 from '../../assets/img/electronics/product/1.jpg'
import CatImg2 from '../../assets/img/electronics/product/2.jpg'
import CatImg3 from '../../assets/img/electronics/product/3.jpg'
import CatImg4 from '../../assets/img/electronics/product/4.jpg'
import CatImg5 from '../../assets/img/electronics/product/5.jpg'
import CatImg6 from '../../assets/img/electronics/product/6.jpg'
import CatImg7 from '../../assets/img/electronics/product/7.jpg'
import CatImg8 from '../../assets/img/electronics/product/8.jpg'
import CatImg9 from '../../assets/img/electronics/product/9.jpg'
import CatImg10 from '../../assets/img/electronics/product/10.jpg'

// Ana kategoriler - JSON verilerine göre güncellenmiş
const getMainCategoriesData = () => {
    return [
        {
            id: 1,
            name: "Bilgisayar & Aksesuarlar",
            slug: "bilgisayar-aksesuarlari",
            img: CatImg1,
            itemCount: 82
        },
        {
            id: 2,
            name: "Kamera & Fotoğraf",
            slug: "kamera-fotograf",
            img: CatImg2,
            itemCount: 24
        },
        {
            id: 3,
            name: "Araç Elektronik",
            slug: "arac-elektronik",
            img: CatImg3,
            itemCount: 1
        },
        {
            id: 4,
            name: "Telefon & Aksesuarlar",
            slug: "telefon-aksesuarlari",
            img: CatImg4,
            itemCount: 0
        },
        {
            id: 5,
            name: "Ses & Müzik",
            slug: "ses-ve-muzik",
            img: CatImg5,
            itemCount: 7
        },
        {
            id: 6,
            name: "Oyun & Eğlence",
            slug: "oyun-ve-eğlence",
            img: CatImg6,
            itemCount: 0
        },
        {
            id: 7,
            name: "Spor & Açık Hava",
            slug: "spor-acik-hava",
            img: CatImg7,
            itemCount: 2
        },
        {
            id: 8,
            name: "Genel Elektronik",
            slug: "elektronik",
            img: CatImg8,
            itemCount: 8
        },
        {
            id: 9,
            name: "Diğer Ürünler",
            slug: "genel",
            img: CatImg9,
            itemCount: 29
        }
    ];
}

export const CategoriesData = [
    {
        id: 1,
        name: "Bilgisayar ve Aksesuarlar",
        slug: "bilgisayar-aksesuarlar",
        img: CatImg1,
        itemCount: 45,
        children: [
            {
                id: 11,
                name: "Bilgisayar Bileşenleri",
                slug: "bilgisayar-bilesenleri",
                children: [
                    { id: 111, name: "CPU İşlemcileri", slug: "cpu-islemcileri" },
                    { id: 112, name: "Bellek (RAM)", slug: "bellek-ram" },
                    { id: 113, name: "Dahili Bileşenler", slug: "dahili-bilesenler" }
                ]
            },
            {
                id: 12,
                name: "Bilgisayar Aksesuarları",
                slug: "bilgisayar-aksesuarlari",
                children: [
                    { id: 121, name: "USB Hub'ları", slug: "usb-hublari" },
                    { id: 122, name: "Raflar ve Dolaplar", slug: "raflar-dolaplar" },
                    { id: 123, name: "KVM Anahtarları", slug: "kvm-anahtarlari" }
                ]
            },
            {
                id: 13,
                name: "Veri Depolama",
                slug: "veri-depolama",
                children: [
                    { id: 131, name: "Harici Katı Hal Sürücüleri (SSD)", slug: "harici-ssd" },
                    { id: 132, name: "USB Flash Sürücüler", slug: "usb-flash-suruculer" }
                ]
            },
            {
                id: 14,
                name: "Dizüstü Bilgisayar Aksesuarları",
                slug: "dizustu-aksesuarlari",
                children: [
                    { id: 141, name: "Yerleştirme İstasyonları", slug: "yerlestirme-istasyonlari" }
                ]
            },
            {
                id: 15,
                name: "Ağ Ürünleri",
                slug: "ag-urunleri",
                children: [
                    { id: 151, name: "Kablosuz Erişim Noktaları", slug: "kablosuz-erisim-noktalari" }
                ]
            },
            {
                id: 16,
                name: "Bilgisayarlar ve Tabletler",
                slug: "bilgisayarlar-tabletler",
                children: [
                    { id: 161, name: "Tabletler", slug: "tabletler" }
                ]
            }
        ]
    },
    {
        id: 2,
        name: "Kamera ve Fotoğraf",
        slug: "kamera-fotograf",
        img: CatImg2,
        itemCount: 32,
        children: [
            {
                id: 21,
                name: "Dijital Kameralar",
                slug: "dijital-kameralar",
                children: [
                    { id: 211, name: "Dijital Kameraları Nokta ve Çekin", slug: "nokta-cek-kameralar" }
                ]
            },
            {
                id: 22,
                name: "Film Fotoğrafçılığı",
                slug: "film-fotografciligi",
                children: [
                    { id: 221, name: "Film Kameraları", slug: "film-kameralari" }
                ]
            },
            {
                id: 23,
                name: "Video",
                slug: "video",
                children: [
                    { id: 231, name: "Kameralar", slug: "video-kameralar" }
                ]
            }
        ]
    },
    {
        id: 3,
        name: "Araç ve Araç Elektroniği",
        slug: "arac-elektronik",
        img: CatImg3,
        itemCount: 28,
        children: [
            {
                id: 31,
                name: "Araç Elektronik Aksesuarları",
                slug: "arac-elektronik-aksesuarlari",
                children: [
                    {
                        id: 311,
                        name: "Ses ve Video Aksesuarları",
                        slug: "ses-video-aksesuarlari",
                        children: [
                            { id: 3111, name: "Bluetooth Kulaklıklar", slug: "arac-bluetooth-kulakliklar" },
                            { id: 3112, name: "Hoparlör Sistemleri", slug: "arac-hoparlor-sistemleri" }
                        ]
                    },
                    { id: 312, name: "Radar Dedektörleri", slug: "radar-dedektorleri" },
                    { id: 313, name: "Araç Yedek Kameralar", slug: "arac-yedek-kameralar" }
                ]
            }
        ]
    },
    {
        id: 4,
        name: "GPS ve Bulucular",
        slug: "gps-bulucular",
        img: CatImg4,
        itemCount: 15,
        children: [
            { id: 41, name: "GPS İzleyicileri", slug: "gps-izleyicileri" },
            { id: 42, name: "Öğe Bulucuları", slug: "oge-buluculari" },
            {
                id: 43,
                name: "Spor ve El GPS",
                slug: "spor-el-gps",
                children: [
                    { id: 431, name: "Golf Sahası GPS Birimleri", slug: "golf-sahasi-gps" }
                ]
            }
        ]
    },
    {
        id: 5,
        name: "Kulaklıklar ve Ses",
        slug: "kulakliklar-ses",
        img: CatImg5,
        itemCount: 38,
        children: [
            {
                id: 51,
                name: "Kulaklık ve Kulaklıklar",
                slug: "kulaklik-kulakliklar",
                children: [
                    { id: 511, name: "Açık Kulak Kulaklıkları", slug: "acik-kulak-kulakliklari" },
                    { id: 512, name: "Earbud Kulaklık", slug: "earbud-kulaklik" }
                ]
            }
        ]
    },
    {
        id: 6,
        name: "Giyilebilir Teknoloji",
        slug: "giyilebilir-teknoloji",
        img: CatImg6,
        itemCount: 22,
        children: [
            { id: 61, name: "Gözlük", slug: "akilli-gozluk" },
            { id: 62, name: "Fitness İzleyicileri", slug: "fitness-izleyicileri" }
        ]
    },
    {
        id: 7,
        name: "Ev Sistemleri",
        slug: "ev-sistemleri",
        img: CatImg7,
        itemCount: 41,
        children: [
            {
                id: 71,
                name: "Ev Ses",
                slug: "ev-ses",
                children: [
                    {
                        id: 711,
                        name: "Hoparlörler",
                        slug: "ev-hoparlorler",
                        children: [
                            { id: 7111, name: "Surround Sound Sistemleri", slug: "surround-sound-sistemleri" }
                        ]
                    }
                ]
            },
            {
                id: 72,
                name: "Televizyon ve Video",
                slug: "televizyon-video",
                children: [
                    { id: 721, name: "Ev Sineması Sistemleri", slug: "ev-sinemasi-sistemleri" },
                    { id: 722, name: "Video Projektörler", slug: "video-projektorler" },
                    {
                        id: 723,
                        name: "Projektör Aksesuarları",
                        slug: "projektor-aksesuarlari",
                        children: [
                            { id: 7231, name: "Ampuller", slug: "projektor-ampulleri" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 8,
        name: "Cep Telefonu Aksesuarları",
        slug: "cep-telefonu-aksesuarlari",
        img: CatImg8,
        itemCount: 19,
        children: [
            {
                id: 81,
                name: "Şarj Cihazları ve Güç Adaptörleri",
                slug: "sarj-cihazlari-guc-adaptorleri",
                children: [
                    { id: 811, name: "Duvar Şarj Cihazları", slug: "duvar-sarj-cihazlari" }
                ]
            }
        ]
    },
    {
        id: 9,
        name: "Ofis Elektroniği",
        slug: "ofis-elektronigi",
        img: CatImg9,
        itemCount: 12,
        children: [
            {
                id: 91,
                name: "Tarayıcılar ve Aksesuarlar",
                slug: "tarayicilar-aksesuarlar",
                children: [
                    { id: 911, name: "Belge Tarayıcıları", slug: "belge-tarayicilari" },
                    { id: 912, name: "Slayt ve Negatif Tarayıcılar", slug: "slayt-negatif-tarayicilar" }
                ]
            },
            {
                id: 92,
                name: "Yazıcılar ve Aksesuarlar",
                slug: "yazicilar-aksesuarlar",
                children: [
                    { id: 921, name: "Etiket Yazıcıları", slug: "etiket-yazicilari" }
                ]
            },
            { id: 93, name: "Ses Konferansı", slug: "ses-konferansi" }
        ]
    },
    {
        id: 10,
        name: "Güvenlik ve Gözetim",
        slug: "guvenlik-gozetim",
        img: CatImg10,
        itemCount: 8,
        children: [
            {
                id: 101,
                name: "Gözetim Video Ekipmanları",
                slug: "gozetim-video-ekipmanlari",
                children: [
                    { id: 1011, name: "Gözetim NVR Kitleri", slug: "gozetim-nvr-kitleri" }
                ]
            }
        ]
    },
    {
        id: 11,
        name: "Taşınabilir Ses ve Video",
        slug: "tasinabilir-ses-video",
        img: CatImg1,
        itemCount: 6,
        children: [
            { id: 111, name: "MP3 ve MP4 Oyuncuları", slug: "mp3-mp4-oyuncular" }
        ]
    },
    {
        id: 12,
        name: "Oyun Sistemleri",
        slug: "oyun-sistemleri",
        img: CatImg2,
        itemCount: 4,
        children: [
            {
                id: 121,
                name: "Eski Sistemler",
                slug: "eski-sistemler",
                children: [
                    {
                        id: 1211,
                        name: "PlayStation Sistemleri",
                        slug: "playstation-sistemleri",
                        children: [
                            { id: 12111, name: "PlayStation Aksesuarları", slug: "playstation-aksesuarlari" }
                        ]
                    }
                ]
            }
        ]
    }
]

// Kategori arama fonksiyonu
export const findCategoryBySlug = (slug) => {
    const searchInCategories = (categories) => {
        for (const category of categories) {
            if (category.slug === slug) {
                return category
            }
            if (category.children) {
                const found = searchInCategories(category.children)
                if (found) return found
            }
        }
        return null
    }
    return searchInCategories(CategoriesData)
}

// Ana kategorileri getir
export const getMainCategories = () => {
    return getMainCategoriesData()
}

// Kategori breadcrumb oluştur
export const getCategoryBreadcrumb = (slug) => {
    const breadcrumb = []
    
    const findPath = (categories, targetSlug, path = []) => {
        for (const category of categories) {
            const currentPath = [...path, category]
            
            if (category.slug === targetSlug) {
                return currentPath
            }
            
            if (category.children) {
                const found = findPath(category.children, targetSlug, currentPath)
                if (found) return found
            }
        }
        return null
    }
    
    const path = findPath(CategoriesData, slug)
    return path || []
}
