const fs = require('fs');
const csv = require('csv-parser');

const inputFile = 'TechnoMarket_Urunler.csv';
const outputFile = 'src/app/data/productEans.json';

const eanMap = {};

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const id = (row['Product ID'] || row['id'] || '').toString().trim();
    const ean = (row['Barkod (EAN Number)'] || row['EAN'] || row['ean'] || row['Barcode'] || '').toString().trim();

    if (id && ean) {
      eanMap[id] = ean;
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(eanMap, null, 2), 'utf8');
    console.log(`EAN haritası ${Object.keys(eanMap).length} kayıtla oluşturuldu: ${outputFile}`);
  })
  .on('error', (error) => {
    console.error('CSV okunurken hata oluştu:', error);
  });

