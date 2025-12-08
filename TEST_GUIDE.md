# Unit Test Kılavuzu

Bu dokümanda projedeki unit testlerini nasıl çalıştıracağınızı ve debug edeceğinizi öğreneceksiniz.

## 🚀 Test Çalıştırma

### Tüm Testleri Çalıştırma

**Interactive Mode:**
```bash
npm test
```
- Dosya değişikliklerini otomatik izler
- `a` - Tüm testleri tekrar çalıştır
- `f` - Sadece başarısız testleri çalıştır
- `q` - Çıkış

**Tek Seferlik:**
```bash
npm test -- --watchAll=false
```

### Belirli Test Dosyası
```bash
npm test -- productSearch.test.js
```

### Coverage Raporu
```bash
npm test -- --coverage --watchAll=false
```

## 🐛 Debug

### VS Code Debugger (Önerilen)

1. **Debug Panel'i açın:** `F5` veya sol menüden "Run and Debug"
2. **Konfigürasyon seçin:**
   - "Debug Jest Tests" - Tüm testler
   - "Debug Current Jest Test File" - Sadece açık dosya
3. **Breakpoint ekleyin:** Test dosyasında veya kaynak kodda satıra tıklayın
4. **Debug'u başlatın:** `F5`

### Console.log ile Debug
```javascript
test('should work', () => {
  console.log('Test başladı');
  const result = myFunction();
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

## 📝 Test Dosyaları

Tüm test dosyaları `src/unittest/` klasörü altında:

- `productSearch.test.js` - Ürün arama testleri
- `whatsappTracker.test.js` - WhatsApp takip testleri
- `user.test.js` - Redux user slice testleri
- `settings.test.js` - Redux settings slice testleri
- `productsData.test.js` - Ürün veri işleme testleri

**Toplam: 68 başarılı test**

## 🔧 Yararlı Komutlar

```bash
# Sadece başarısız testleri göster
npm test -- --onlyFailures

# Detaylı çıktı
npm test -- --verbose

# Test ismi ile filtrele
npm test -- --testNamePattern="should return"
```

## 💡 İpuçları

- **Watch Mode:** `npm test` komutu watch mode'da çalışır
- **Breakpoint'ler:** VS Code'da hem test hem kaynak kodda breakpoint ekleyebilirsiniz
- **Debug Tuşları:**
  - `F10` - Step Over
  - `F11` - Step Into
  - `Shift+F11` - Step Out
  - `F5` - Continue
