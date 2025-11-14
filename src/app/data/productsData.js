// Tüm ürün verilerini JSON'dan yükle
import allProductsData from './allProducts.json'
import categoryTreeData from './categoryTree.json'
import productEans from './productEans.json'

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
}

// Ürünleri formatla ve ID ekle
const formatProducts = () => {
    return allProductsData.map((product, index) => {
        // Yeni obje oluştur (readonly property hatasını önlemek için)
        const formattedProduct = { ...product };
        const productIdString = (formattedProduct.id || formattedProduct['Product ID'] || formattedProduct.productId || '').toString();
        const numericId = parseInt(productIdString, 10);

        // ID'yi sayıya çevir ve yedekle
        formattedProduct.originalId = productIdString || null;
        formattedProduct.id = Number.isNaN(numericId) ? index + 1 : numericId;
        
        // Eğer productCode yoksa oluştur
        if (!formattedProduct.productCode) {
            formattedProduct.productCode = generateProductCode(formattedProduct.name || formattedProduct['Product Name']);
        }

        // EAN bilgisini ekle
        if (!formattedProduct.ean) {
            formattedProduct.ean =
                formattedProduct['ean'] ||
                formattedProduct['EAN'] ||
                formattedProduct['EAN Number'] ||
                formattedProduct['Barkod (EAN Number)'] ||
                productEans[productIdString] ||
                null;
        } else if (!formattedProduct.ean && productEans[productIdString]) {
            formattedProduct.ean = productEans[productIdString];
        }
        
        // Ana görseli image attribute'undan öncelikli olarak al
        // image -> img -> mainImage -> images[0] sırasıyla kontrol et
        if (formattedProduct.image) {
            formattedProduct.img = formattedProduct.image;
            formattedProduct.mainImage = formattedProduct.image;
        } else if (formattedProduct.img) {
            formattedProduct.mainImage = formattedProduct.img;
        } else if (formattedProduct.mainImage) {
            formattedProduct.img = formattedProduct.mainImage;
        } else if (formattedProduct.images && formattedProduct.images.length > 0) {
            formattedProduct.img = formattedProduct.images[0];
            formattedProduct.mainImage = formattedProduct.images[0];
        }
        
        // title alanını name'den oluştur
        if (!formattedProduct.title) {
            formattedProduct.title = formattedProduct.name || formattedProduct['Product Name'];
        }
        
        // inStock varsayılan olarak true
        if (formattedProduct.inStock === undefined) {
            formattedProduct.inStock = true;
        }
        
        return formattedProduct;
    });
}

export const getProductsData = () => {
    return formatProducts();
}


// Eski 5 ürünlü versiyon (backup için)
export const getFirstFiveProducts = () => {
    return [
    {
        id: 1,
            title: "USB 3.0 Hub, 4 bağlantı noktası USB hub ayırıcı, taşınabilir USB adaptör mini multiport genişletme masaüstü, dizüstü bilgisayar, xbox, flash sürücü, hdd, konsol, yazıcı, pc, klavyeler, hp, dell",
            titleEn: "USB 3.0 Hub, 4 Port USB Hub Splitter,Portable USB Adapter Mini Multiport Expander for Desktop, Laptop, Xbox, Flash Drive, HDD, Console, Printer, PC, Keyboards, HP, Dell",
            asin: "B0BWH9DZRV",
            productCode: generateProductCode("USB 3.0 Hub, 4 bağlantı noktası USB hub ayırıcı, taşınabilir USB adaptör mini multiport genişletme masaüstü, dizüstü bilgisayar, xbox, flash sürücü, hdd, konsol, yazıcı, pc, klavyeler, hp, dell"),
            category: "bilgisayar-aksesuarlari",
            categoryPath: "Elektronik -> Bilgisayarlar ve Aksesuarlar -> Bilgisayar Aksesuarları ve Çevreselleri -> USB Hub'ları",
            images: [
                "https://m.media-amazon.com/images/I/51-8fOEc8lL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/81gMOpfWHfL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71MuOmk1xCL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/61oNZgvSKtL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/81OG9CS53eL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/51IFBKbuCnL._AC_SL1500_.jpg"
            ],
            brand: "Visit the ANYPLUS Store",
            price: (9 * 50) * 5 + 5000, // (Fiyat (USD) * 50) * 5 + 5000 = 7250 TL
            originalPrice: 9,
            description: "【Multi USB bağlantı noktası】 Bu USB HUB, bilgisayarın bir USB bağlantı noktasını dört bağlantı noktasına kolayca genişletebilir, dört bağlantı noktasını, herhangi bir basınç olmadan aynı anda çalışmak için destekleyebilir ve sıcaklığı orta aralıkta tutabilir. Tak ve oynatma, sürücü gerekmez, kullanımı kolay | Not: Bu merkez şarj cihazları için uygun değildir, çünkü maksimum çıkış akımı sadece 900mA olduğundan çok yavaş şarj hızlarına neden olur. Bu nedenle, optimum performansı sağlamak için yalnızca veri aktarımı ve periferik bağlantılar için kullanılması önerilir. | 【Geniş Uyumluluk ve Uygulama】 Dizüstü bilgisayar için bu USB merkezi, Windows 10/8/8.1/7/Vista/XP ve Mac OS X, Linux ve Chrome OS ile uyumludur. 4-Port USB Genişletici Çeşitli cihazlar için geçerlidir: dizüstü bilgisayar, PC Tower, Xbox, PS4, Flash Drive, Yazıcı, Fare, Kart Okuyucu, HDD, Cep Telefonu Otg Adaptörü, Klavye, Kamera, Konsol, USB Fan ve USB Kabloları | 【Yüksek hızlı veri hub】 5Gbps (USB 3.0), 480Mbps (USB 2.0) ve 12Mbps (USB 1.1) aktarım hızlarını destekler. Not: Bu Hub Destek çıkışı 900mA'ya kadar maksimum akım. Bu yüzden 900mA'dan fazla bir akıma ihtiyaç duyan bazı HDD'lerin harici bir güç adaptörüne ihtiyacı var | 【Sorunsuz hizmet】 Any Plus ekibimizde profesyonel teknik ekibi ve mükemmel müşteri hizmetleri vardır. 24 saat çevrimiçi müşteri hizmeti. Ürünle ilgili herhangi bir sorun varsa ， Lütfen bizimle iletişime geçmekten çekinmeyin ve sorununuzu çözmek için elimizden geleni yapacağız",
            amazonLink: "https://www.amazon.com/ANYPLUS-Splitter-Portable-Multiport-Keyboards/dp/B0BWH9DZRV/ref=sr_1_1_sspa?c=ts&dib=eyJ2IjoiMSJ9.Zcsn--hHfNaiX1W8Qyks34GZVTcnb3M6ZJWqCViaC-j4ZHSmmMTQYgy4V3MgbnGfgFiCxZFKEs-TdFjE_JfR9P4any1Egej1Y8YWWvOh8lVDB6EBt4J0ppQL7WmheojjdOMPiKwvWLlFXnDx9qSD5wE2VsVDafokdaqaP5hx_RelU4A_IECru-0Bgi1P-bkqJuzD0Jw5_EqU1k5cBLUPHt1mJ8EcDWWwcdfXsEV85O4.4CppRMEnNl1JA-D48e1K-fdbIpQiyrNkZowLcawmUiU&dib_tag=se&keywords=PC%2BAccessories&qid=1759596721&s=videogames&sr=1-1-spons&ts_id=318813011&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1",
            inStock: true,
            rating: 4.5,
            reviewCount: 128,
            features: [
                "4 Port USB 3.0 Hub",
                "5Gbps Transfer Hızı",
                "Plug & Play",
                "Geniş Uyumluluk",
                "Kompakt Tasarım"
            ],
            specifications: {
                "Port Sayısı": "4",
                "USB Versiyonu": "3.0",
                "Maksimum Akım": "900mA",
                "Uyumluluk": "Windows, Mac, Linux",
                "Boyutlar": "Kompakt"
            }
    },
    {
        id: 2,
            title: "Makita için 350W Güç İnverter 18V LXT LI-ION Pil, 2-Portlu Tedarik İnvertör Jeneratörleri Dönüştürücü DC 20V ila AC 110V ~ 120V LED Işık, 3 USB-A, 1 Tip-C, 1DC Port, Açık Seyahat Kampı için",
            titleEn: "350W Power Inverter for Makita 18V LXT Li-ion Battery,2-Port Supply Inverter Generators Converter DC 20V to AC 110V ~120V with LED Light,3 USB-A,1 Type-C,1DC Port, for Outdoor Travel Camping",
            asin: "B0D4PGCXNL",
            productCode: generateProductCode("Makita için 350W Güç İnverter 18V LXT LI-ION Pil, 2-Portlu Tedarik İnvertör Jeneratörleri Dönüştürücü DC 20V ila AC 110V ~ 120V LED Işık, 3 USB-A, 1 Tip-C, 1DC Port, Açık Seyahat Kampı için"),
            category: "arac-elektronik-aksesuarlari",
            categoryPath: "Elektronik -> Araç ve Araç Elektronik -> Araç Elektronik Aksesuarları -> Ses ve Video Aksesuarları",
            images: [
                "https://m.media-amazon.com/images/I/71uQd24RuvL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71vNq5YEN1L._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/61RccHCabZL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/816VJdASGFL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/712rtG1k95L._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/711pZvcwV5L._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/816ndC3juPL._AC_SL1500_.jpg"
            ],
            brand: "Brand: POFGVTWNY",
            price: (86 * 50) * 5 + 5000, // 26500 TL
            originalPrice: 86,
            description: "【Maksimum çıkış 350W】 İnvertör etkinleştirildikten ve dönüştürüldükten sonra, AC soketinden çekilebilen maksimum güç 350W'dır. Bu güç sınırını aşan ürünler, invertörün otomatik olarak kapanmasına neden olarak koruma işlevini etkinleştirir. İpucu: Her bir pilin işlevselliğini doğrulamanız gerekiyorsa, ekranda karşılık gelen 1, 2, 3, 4 sayıları görüntülenir. Ekranın olmaması arızayı gösterir. | 【AC GÜÇ AÇIK VE KAPALI】 Switch (POEWR) tuşuna basın ve ekran yanar; 3USB, C Tipi, DC bağlantı noktası ve ışık fonksiyonları normal şekilde çalışır. AC soketini etkinleştirmek için, gösterge （Göstergesi）））））））））））））））））））））） düğmesini basılı tutun. AC soketini devre dışı bırakmak için AC düğmesini tekrar basılı tutun. Gösterge kapanırsa, sistemin başarıyla kapatıldığı anlamına gelir。 | 【2 bağlantı noktası 350W güç inverter Makita pilleri】 Makita pilleri için DC 18V'yi AC 110V'ye dönüştürmek için bir invertöre koyun. Makita 18V LXT Li-ion Pilleri ile uyumlu BL1430,BL1440,BL1450,BL1460,BL1815,BL1830,BL1840,BL1850,BL1860,BL1430B,BL1460B,BL1815B,BL1820B,BL1830B,BL1835B,BL1840B,BL1845B,BL1850B,BL1860B etc (Piller dahil değildir). | 【Çoklu Çıktı】 Taşınabilir elektrik santrali AC110-120V çıkış bağlantı noktası, 3*USB-A bağlantı noktaları (5V 2.1A), 1*Tip-C (PD3.0,18W) ve 1*DC çıkışı (12V 5A) ile donatılmıştır. Bu çıkışlar, dizüstü bilgisayarlar, telefonlar, tabletler, kameralar, dronlar, radyolar, USB destekli gece ışıkları, mini fanlar, buzdolabı ve 350W altında güç olan elektrik ürünleri gibi çeşitli cihazlar için sabit ve güvenli güç sağlar. Şantiyeler, kamp, ​​RV, balıkçılık, avcılık, yürüyüş ve acil durumlar veya elektrik kesintileri gibi açık hava etkinlikleri için uygundur. | 【Acil kullanım için LED Işık】 Makita piller için 300 lümen LED ışıkla donatılmış açık jeneratör 4 parlaklık seviyesini destekleyen (düşük, orta, güçlü, SOS yanıp sönen), kamp için acil bir ışık kaynağı olarak kullanılabilir, karanlıkta ve diğer birçok durum.",
            amazonLink: "https://www.amazon.com/Inverter-Battery-Generators-Converter-Outdoor/dp/B0D4PGCXNL/ref=sr_1_5_sspa?currency=USD&dib=eyJ2IjoiMSJ9.lmOCVuKtwl5dnH_xklO7kQ.TM4Z-_LPhFFT36cGYylFqh4dVXynpuo-it8r0PsUswM&dib_tag=se&qid=1759667437&s=electronics&sr=1-5-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGZfYnJvd3Nl&th=1",
            inStock: true,
            rating: 4.2,
            reviewCount: 89,
            features: [
                "350W Maksimum Güç",
                "Makita 18V Uyumlu",
                "3 USB-A + 1 Type-C",
                "LED Işık",
                "Açık Hava Kullanımı"
            ],
            specifications: {
                "Maksimum Güç": "350W",
                "Giriş Voltajı": "18V DC",
                "Çıkış Voltajı": "110-120V AC",
                "USB Portları": "3x USB-A + 1x Type-C",
                "LED Işık": "300 Lümen"
            }
    },
    {
        id: 3,
            title: "Fujifilm Instax Mini 12 Anında Kamera Paketi - 20 Çekim Film, Özel Case, Deluxe 60 Cep Fotoğraf Albümü ve Bluebirdsales Aksesuarları - Otomatik Pozlama, Selfie Mirror, Pastel Blue içerir",
            titleEn: "Fujifilm Instax Mini 12 Instant Camera Bundle - Includes 20 Shots Film, Custom Case, Deluxe 60-Pocket Photo Album & BluebirdSales Accessories - Auto Exposure, Selfie Mirror, Pastel Blue",
            asin: "B0D6C6GG9X",
            productCode: generateProductCode("Fujifilm Instax Mini 12 Anında Kamera Paketi - 20 Çekim Film, Özel Case, Deluxe 60 Cep Fotoğraf Albümü ve Bluebirdsales Aksesuarları - Otomatik Pozlama, Selfie Mirror, Pastel Blue içerir"),
            category: "film-fotografciligi",
            categoryPath: "Elektronik -> Kamera ve Fotoğraf -> Film Fotoğrafçılığı -> Film Kameraları",
            images: [
                "https://m.media-amazon.com/images/I/615Kr0pC1zL._AC_SL1080_.jpg",
                "https://m.media-amazon.com/images/I/71sTxonQALL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/61E2raBHN1L._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/61TOSBgwZ4L._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71FMzbuqMML._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/616knEG3pmL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71Pu-SNwIuL._AC_SL1500_.jpg"
            ],
            brand: "Brand: BluebirdSales",
            price: (129 * 50) * 5 + 5000, // 37250 TL
            originalPrice: 129,
            description: "Fujifilm Instax Mini 12 Anında Kamera Paketi, keskin, yüksek kaliteli görüntüleme özellikleri ile ünlüdür ve detay ve netlikle fotoğraf çekmenize izin verir. İster yakın çekimler ister geniş çekimler çekiyor olun, bu lens her görüntünün net olmasını sağlar, bu da anılarınızı canlı renkler ve hassas odak ile öne çıkarır. | 20 Instax Mini Filmler: Paket, anıları hemen yakalamaya başlamanıza izin veren 20 sayfa Instax mini filmi içeriyor. Bu filmler, Instax Mini serisi ile çalışmak için özel olarak tasarlanmıştır ve sadece birkaç dakika içinde gözlerinizden önce gelişen renkler ve keskin detaylarla yüksek kaliteli görüntüler üretir. | Özel takılmış kılıf: Fujifilm Instax Mini 12'nizi, kameranızı çarpmalardan, çiziklerden ve günlük aşınma ve yıpranmadan korumak için tasarlanmış özel takılmış minimum kasa ile koruyun. Bu dayanıklı kasa, kameranızın koşulda kalmasını sağlarken, aynı zamanda bir stil dokunuşu ekler. | Renkli mini çerçeveler: Dahil olan beş renkli mini çerçeveyle anlık baskılarınıza yaratıcı bir yetenek ekleyin. Bu anlık kamera çerçeveleri sadece fotoğraflarınızı korumakla kalmaz, aynı zamanda onları eğlenceli ve kişiselleştirilmiş bir şekilde sergilemenize izin verir, bu da onları alanınızı dekore etmek veya arkadaşlara hediye etmek için mükemmel hale getirir. | Deluxe 60 cep fotoğraf albümü: Keep Your değerli fotoğraflar, Deluxe 60 cepli fotoğraf albümü The Bundle ile düzenli ve güvenli. Bu mini 12 kamera seti albümü, kredi kartı büyüklüğündeki baskılarınızı tutmak ve korumak için tasarlanmıştır, bu da en sevdiğiniz anları herhangi bir zamanda kolayca çevirmenizi ve yeniden yaşamanızı sağlar.",
            amazonLink: "https://www.amazon.com/Fujifilm-Instax-Instant-Camera-Bundle/dp/B0D6C6GG9X/ref=sr_1_1_sspa?dib=eyJ2IjoiMSJ9.lmOCVuKtwl5dnH_xklO7kQ.TM4Z-_LPhFFT36cGYylFqh4dVXynpuo-it8r0PsUswM&dib_tag=se&qid=1759667576&s=electronics&sr=1-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfYnJvd3Nl&th=1",
            inStock: true,
            rating: 4.7,
            reviewCount: 256,
            features: [
                "Anında Fotoğraf",
                "20 Film Dahil",
                "Otomatik Pozlama",
                "Selfie Mirror",
                "Pastel Blue Renk"
            ],
            specifications: {
                "Film Boyutu": "Instax Mini",
                "Film Sayısı": "20 Adet",
                "Renk": "Pastel Blue",
                "Özellikler": "Otomatik Pozlama, Selfie Mirror",
                "Aksesuarlar": "Case, Albüm, Çerçeveler"
            }
    },
    {
        id: 4,
            title: "4K video kamera, 2'den 1 dijital monoküler teleskop kamera, manuel odak 48MP fotoğraf maks.",
            titleEn: "4K Video Camcorder, 2 in 1 Digital Monocular Telescope Camera, Manual Focus 48MP Photo Max 4000ft 104X Digital Telescope Video Camera with 3.0\" Screen/Hood/Battery/SD Card/Case",
            asin: "B0FG7CNCMD",
            productCode: generateProductCode("4K video kamera, 2'den 1 dijital monoküler teleskop kamera, manuel odak 48MP fotoğraf maks."),
            category: "video-kameralar",
            categoryPath: "Elektronik -> Kamera ve Fotoğraf -> Video -> kameralar",
            images: [
                "https://m.media-amazon.com/images/I/71aKC00j+ML._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/61HzE1Oq-XL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71FaxxldYQL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/811Tph9TxRL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/71neXdexICL._AC_SL1500_.jpg",
                "https://m.media-amazon.com/images/I/81exxWNqtnL._AC_SL1500_.jpg"
            ],
            brand: "Brand: Dumjug",
            price: (39 * 50) * 5 + 5000, // 14750 TL
            originalPrice: 39,
            description: "2 arada 1 monoküler, sadece teleskop değil, aynı zamanda bir video kamera kamerası 4K, avcılık için çok fonksiyonlu dijital teleskop, kuş gözlemciliği, gezi, yürüyüş, hızlandırılmış video kaydı, sürekli fotoğraf çekimi mevcut | Bu monoküler teleskopun merceğindeki manuel odak tekerleği, yakın veya uzak odaklanacak şekilde ayarlanabilir. 13x optik büyütme, yatay olarak 4.5 derece ve dikey olarak 3.5 derece. Dijital büyütme olmadan, insanları 1.300 metre mesafede, 1.000 metre mesafede yaban domuzu ve 250 metre mesafede tavukları görebilirsiniz. | Yaban hayatı izlemek için yüksek tanımlı dijital monoküler teleskop kamerası. Bu dijital teleskop 13x optik büyütme, artı 8x dijital zoom, bu nedenle maksimum 104x büyütme monoküler. | Av için harika teleskop kamerası, dijital kamera ve kamera olarak da çalışır. Gözlemlediğiniz nesne için daha fazla ayrıntı kaydeden maksimum 4K video klipler ve 48MP fotoğraflar alabilir. Ayrıca bu 4K video kamerayı etkinlikler, etkinlikler, tatil, doğum günü partisi vb. Bu 4K teleskop kamerası, 3 \"büyük ekran ve kaputla birlikte gelir, dış mekanı kolayca gözlemlemenizi sağlar. Ve uzun süren büyük şarj edilebilir pil 4000mAH | SD kartı, kasa, USB kablosu, mini tripod, temizlik bezi dahil zengin aksesuarlar ile zengin aksesuarlar, vahşi yaşamı izlemek için kamera izlemek için zengin aksesuarlar",
            amazonLink: "https://www.amazon.com/Dumjug-Camcorder-Digital-Monocular-Telescope/dp/B0FG7CNCMD/ref=sr_1_2_sspa?dib=eyJ2IjoiMSJ9.lmOCVuKtwl5dnH_xklO7kQ.TM4Z-_LPhFFT36cGYylFqh4dVXynpuo-it8r0PsUswM&dib_tag=se&qid=1759667576&s=electronics&sr=1-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfYnJvd3Nl&th=1",
            inStock: true,
            rating: 4.0,
            reviewCount: 45,
            features: [
                "4K Video Kayıt",
                "48MP Fotoğraf",
                "104X Büyütme",
                "3\" Ekran",
                "4000mAh Pil"
            ],
            specifications: {
                "Video Kalitesi": "4K",
                "Fotoğraf Çözünürlüğü": "48MP",
                "Büyütme": "13x Optik + 8x Dijital",
                "Ekran": "3\" LCD",
                "Pil": "4000mAh"
            }
    },
    {
        id: 5,
            title: "Lensy ekran ücretsiz dijital kamera | Dört yerleşik filtre | Şarj edilebilir, 8MP, hafif, odaksuz, otomatik flaş, kullanımı kolay, yeniden kullanılabilir, retro film tarzı fotoğraflar (Forest Green)",
            titleEn: "LENSY Screen Free Digital Camera | Four Built in Filters | Rechargeable, 8mp, Lightweight, Focus-Free, Auto-Flash, Easy-to-Use, Reusable, Retro Film-Style Photos (Forest Green)",
            asin: "B0FDJVBCMF",
            productCode: generateProductCode("Lensy ekran ücretsiz dijital kamera | Dört yerleşik filtre | Şarj edilebilir, 8MP, hafif, odaksuz, otomatik flaş, kullanımı kolay, yeniden kullanılabilir, retro film tarzı fotoğraflar (Forest Green)"),
            category: "dijital-kameralar",
            categoryPath: "Electronics -> Kamera ve Fotoğraf -> Dijital Kameralar -> Dijital Kameraları Nokta ve Çekin",
            images: [
                "https://m.media-amazon.com/images/I/613pfvhjv9L._AC_SL1200_.jpg",
                "https://m.media-amazon.com/images/I/51pMuWjHUxL._AC_SL1200_.jpg",
                "https://m.media-amazon.com/images/I/51CrMpPETRL._AC_SL1237_.jpg",
                "https://m.media-amazon.com/images/I/51J4a8WrJhL._AC_SL1200_.jpg",
                "https://m.media-amazon.com/images/I/61BQtR4cv3L._AC_SL1200_.jpg"
            ],
            brand: "Visit the Lensy Store",
            price: (64 * 50) * 5 + 5000, // 21000 TL
            originalPrice: 64,
            description: "Retro Design, tek kullanımlık bir kameranın cazibesini nostaljik bir his için taklit eder. Kolay açma-kapama geçiş ve bilek kayışı dahildir. | Dört yerleşik filtre ve herhangi bir zamanda takas edebileceğiniz bir flaş geçişi. Filtreler: Klasik, Retro, Analog ve Siyah Beyaz | Hafif ve taşınabilir, seyahat için mükemmel ve yarım kilo daha düşük günlük maceralar | Fotoğraflarınıza hızlı erişim ve arkadaşlarınızla paylaşmak için USB-C bağlantısı üzerinden kolay fotoğraf aktarımı | 4: 3 Fotoğraf Çerçevesi Oranı Anılarınızı Instagram, Tik Tok, Facebook ve Diğer Sosyal Medya Platformlarında Paylaşmak İçin Mükemmeldir | Depolama: Bir kerede yaklaşık 2.000 fotoğraf saklayarak 4GB TF kartı ile qualped.",
            amazonLink: "https://www.amazon.com/Rechargeable-Lightweight-Focus-Free-Auto-Flash-Film-Style/dp/B0FDJVBCMF/ref=sr_1_3_sspa?dib=eyJ2IjoiMSJ9.lmOCVuKtwl5dnH_xklO7kQ.TM4Z-_LPhFFT36cGYylFqh4dVXynpuo-it8r0PsUswM&dib_tag=se&qid=1759667576&s=electronics&sr=1-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfYnJvd3Nl&th=1",
            inStock: true,
            rating: 4.3,
            reviewCount: 178,
            features: [
                "Retro Tasarım",
                "4 Yerleşik Filtre",
                "8MP Çözünürlük",
                "USB-C Bağlantı",
                "4GB TF Kart"
            ],
            specifications: {
                "Çözünürlük": "8MP",
                "Filtreler": "4 Adet (Klasik, Retro, Analog, Siyah-Beyaz)",
                "Bağlantı": "USB-C",
                "Depolama": "4GB TF Kart",
                "Ağırlık": "Yarım Kilo Altı"
            }
        }
    ]
}

// Kategori slug'ından kategori adını bul
const getCategoryNameBySlug = (slug) => {
    for (const [mainCat, data] of Object.entries(categoryTreeData)) {
        if (data.slug === slug) {
            return mainCat;
        }
        // Alt kategorileri kontrol et
        for (const [subCat, subData] of Object.entries(data.subcategories)) {
            if (subData.slug === slug) {
                return subCat;
            }
        }
    }
    return null;
}

// Kategoriye göre ürünleri filtrele
export const getProductsByCategory = (categorySlug) => {
    const products = getProductsData();
    
    if (categorySlug === 'all' || categorySlug === 'tum-urunler') {
        return products;
    }
    
    // Ana kategori slug'ından kategori adını bul
    const categoryName = getCategoryNameBySlug(categorySlug);
    if (!categoryName) {
        return [];
    }
    
    // Kategori ağacından tam kategori yollarını bul
    const matchingCategories = [];
    for (const [mainCat, data] of Object.entries(categoryTreeData)) {
        if (data.slug === categorySlug || mainCat === categoryName) {
            // Ana kategori eşleşiyorsa, tüm alt kategorilerini ekle
            for (const [subCat, subData] of Object.entries(data.subcategories)) {
                matchingCategories.push(...subData.full_paths);
            }
            // Eğer alt kategori yoksa, ana kategoriyi ekle
            if (Object.keys(data.subcategories).length === 0) {
                matchingCategories.push(mainCat);
            }
        } else {
            // Alt kategori kontrolü
            for (const [subCat, subData] of Object.entries(data.subcategories)) {
                if (subData.slug === categorySlug || subCat === categoryName) {
                    matchingCategories.push(...subData.full_paths);
                }
            }
        }
    }
    
    // Ürünleri filtrele
    return products.filter(product => {
        const productCategory = product.category || '';
        // Tam kategori yolu eşleşmesi
        if (matchingCategories.includes(productCategory)) {
            return true;
        }
        // Ana kategori eşleşmesi (">" ile başlayan kategoriler için)
        if (productCategory.includes('>')) {
            const mainCat = productCategory.split('>')[0].trim();
            if (mainCat === categoryName) {
                return true;
            }
        } else if (productCategory === categoryName) {
            return true;
        }
        return false;
    });
}

// Ana kategorileri getir
export const getMainCategories = () => {
    return Object.keys(categoryTreeData).map(mainCat => {
        const data = categoryTreeData[mainCat];
        return {
            name: mainCat,
            slug: data.slug,
            subcategories: Object.keys(data.subcategories).map(subCat => ({
                name: subCat,
                slug: data.subcategories[subCat].slug
            }))
        };
    });
}

// Kategori ağacını getir
export const getCategoryTree = () => {
    return categoryTreeData;
}

// ID'ye göre ürün bul
export const getProductById = (id) => {
    const products = getProductsData()
    return products.find(product => product.id === parseInt(id))
}