import { generateProductCode } from '../app/data/productsData';

describe('productsData utility functions', () => {
  describe('generateProductCode', () => {
    test('should generate a 6-digit code for product name', () => {
      const code = generateProductCode('Laptop Computer');
      expect(code).toMatch(/^\d{6}$/);
    });

    test('should generate consistent codes for same input', () => {
      const code1 = generateProductCode('Laptop Computer');
      const code2 = generateProductCode('Laptop Computer');
      expect(code1).toBe(code2);
    });

    test('should generate different codes for different inputs', () => {
      const code1 = generateProductCode('Laptop Computer');
      const code2 = generateProductCode('Smartphone');
      expect(code1).not.toBe(code2);
    });

    test('should handle Turkish characters', () => {
      const code = generateProductCode('Telefon Kamera');
      expect(code).toMatch(/^\d{6}$/);
    });

    test('should remove special characters', () => {
      const code1 = generateProductCode('Laptop-Computer!');
      const code2 = generateProductCode('Laptop Computer');
      expect(code1).toBe(code2);
    });

    test('should handle empty spaces', () => {
      const code1 = generateProductCode('Laptop  Computer');
      const code2 = generateProductCode('Laptop Computer');
      expect(code1).toBe(code2);
    });

    test('should be case insensitive', () => {
      const code1 = generateProductCode('LAPTOP COMPUTER');
      const code2 = generateProductCode('laptop computer');
      expect(code1).toBe(code2);
    });

    test('should generate code in valid range (100000-999999)', () => {
      const code = generateProductCode('Test Product');
      const codeNum = parseInt(code, 10);
      expect(codeNum).toBeGreaterThanOrEqual(100000);
      expect(codeNum).toBeLessThanOrEqual(999999);
    });

    test('should handle very long product names', () => {
      const longName = 'A'.repeat(1000);
      const code = generateProductCode(longName);
      expect(code).toMatch(/^\d{6}$/);
    });

    test('should handle numbers in product name', () => {
      const code = generateProductCode('Product 2024');
      expect(code).toMatch(/^\d{6}$/);
    });
  });
});

