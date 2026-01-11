// Kategorileri Firebase'e taşıma scripti
// Bu script, categoryTree.json'dan kategorileri alır ve Firebase'e taşır
// Sadece altında ürün olan kategorileri taşır

const admin = require('firebase-admin');
const categoryTreeData = require('../src/app/data/categoryTree.json');

// Firebase Admin'i başlat
const serviceAccount = require('../serviceAccountKey.json'); // Firebase service account key dosyası
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateCategoriesToFirebase() {
  try {
    console.log('=== Kategoriler Firebase\'e taşınıyor ===\n');

    // Tüm ürünleri al
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Toplam ${products.length} ürün bulundu\n`);

    // Kategori -> Ürün mapping'i oluştur
    const categoryProductsMap = new Map(); // { "Ana Kategori > Alt Kategori": [product1, product2, ...] }

    products.forEach((product) => {
      const categoryPath = product.category || product.categoryPath || '';
      if (categoryPath) {
        if (!categoryProductsMap.has(categoryPath)) {
          categoryProductsMap.set(categoryPath, []);
        }
        categoryProductsMap.get(categoryPath).push({
          id: product.id,
          title: product.title || product.name,
          price: product.price,
          image: product.img || product.image
        });
      }
    });

    console.log(`${categoryProductsMap.size} farklı kategori yolu bulundu\n`);

    // Kategori yapısını oluştur
    const categoriesToSave = [];

    for (const [mainCategoryName, mainCategoryData] of Object.entries(categoryTreeData)) {
      const subcategories = mainCategoryData.subcategories || {};
      
      // Alt kategorileri kontrol et
      for (const [subCategoryName, subCategoryData] of Object.entries(subcategories)) {
        const fullPaths = subCategoryData.full_paths || [];
        
        // Bu alt kategoride ürün var mı kontrol et
        let hasProducts = false;
        const subCategoryProducts = [];

        for (const fullPath of fullPaths) {
          if (categoryProductsMap.has(fullPath)) {
            hasProducts = true;
            subCategoryProducts.push(...categoryProductsMap.get(fullPath));
          }
        }

        // Eğer bu alt kategoride ürün varsa, kaydet
        if (hasProducts && subCategoryProducts.length > 0) {
          // Ana kategoriyi ekle (eğer daha önce eklenmediyse)
          let mainCategoryDoc = categoriesToSave.find(cat => cat.name === mainCategoryName);
          if (!mainCategoryDoc) {
            mainCategoryDoc = {
              name: mainCategoryName,
              slug: mainCategoryData.slug,
              type: 'main',
              subcategories: []
            };
            categoriesToSave.push(mainCategoryDoc);
          }

          // Alt kategoriyi ekle
          mainCategoryDoc.subcategories.push({
            name: subCategoryName,
            slug: subCategoryData.slug,
            products: subCategoryProducts,
            productCount: subCategoryProducts.length
          });

          console.log(`✓ ${mainCategoryName} > ${subCategoryName}: ${subCategoryProducts.length} ürün`);
        }
      }
    }

    console.log(`\nToplam ${categoriesToSave.length} ana kategori, ${categoriesToSave.reduce((sum, cat) => sum + cat.subcategories.length, 0)} alt kategori bulundu\n`);

    // Firebase'e kaydet
    console.log('Firebase\'e kaydediliyor...\n');

    for (const mainCategory of categoriesToSave) {
      const mainCategoryRef = db.collection('categories').doc(mainCategory.slug);
      
      // Ana kategori bilgilerini kaydet
      await mainCategoryRef.set({
        name: mainCategory.name,
        slug: mainCategory.slug,
        type: 'main',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✓ Ana kategori kaydedildi: ${mainCategory.name}`);

      // Alt kategorileri kaydet
      for (const subCategory of mainCategory.subcategories) {
        const subCategoryRef = mainCategoryRef.collection('subcategories').doc(subCategory.slug);
        
        await subCategoryRef.set({
          name: subCategory.name,
          slug: subCategory.slug,
          parentCategory: mainCategory.name,
          parentCategorySlug: mainCategory.slug,
          products: subCategory.products,
          productCount: subCategory.productCount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`  ✓ Alt kategori kaydedildi: ${subCategory.name} (${subCategory.productCount} ürün)`);
      }
    }

    console.log('\n✅ Tüm kategoriler Firebase\'e taşındı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Script'i çalıştır
migrateCategoriesToFirebase().then(() => {
  console.log('\nScript tamamlandı.');
  process.exit(0);
}).catch((error) => {
  console.error('Script hatası:', error);
  process.exit(1);
});

