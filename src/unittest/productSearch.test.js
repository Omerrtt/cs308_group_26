import {
  tokenizeSearch,
  matchesAnySearchToken,
  matchesAllSearchTokens,
  filterProductsBySearch
} from '../utils/productSearch';

describe('productSearch utility functions', () => {
  describe('tokenizeSearch', () => {
    test('should return empty array for null input', () => {
      expect(tokenizeSearch(null)).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      expect(tokenizeSearch(undefined)).toEqual([]);
    });

    test('should return empty array for empty string', () => {
      expect(tokenizeSearch('')).toEqual([]);
    });

    test('should tokenize simple text', () => {
      expect(tokenizeSearch('laptop')).toEqual(['laptop']);
    });

    test('should tokenize text with spaces', () => {
      expect(tokenizeSearch('laptop computer')).toEqual(['laptop', 'computer']);
    });

    test('should convert to lowercase', () => {
      expect(tokenizeSearch('LAPTOP Computer')).toEqual(['laptop', 'computer']);
    });

    test('should split on punctuation', () => {
      expect(tokenizeSearch('laptop,computer;phone')).toEqual(['laptop', 'computer', 'phone']);
    });

    test('should handle Turkish characters', () => {
      expect(tokenizeSearch('telefon kamera')).toEqual(['telefon', 'kamera']);
    });

    test('should filter out empty tokens', () => {
      expect(tokenizeSearch('laptop   computer')).toEqual(['laptop', 'computer']);
    });

    test('should handle numbers', () => {
      expect(tokenizeSearch('laptop 2024')).toEqual(['laptop', '2024']);
    });
  });

  describe('matchesAnySearchToken', () => {
    const mockProduct = {
      name: 'Laptop Computer',
      description: 'High performance laptop',
      ean: '123456789',
      id: 1,
      originalId: '1'
    };

    test('should return false for empty tokens', () => {
      expect(matchesAnySearchToken(mockProduct, [])).toBe(false);
    });

    test('should return false for null product', () => {
      expect(matchesAnySearchToken(null, ['laptop'])).toBe(false);
    });

    test('should return true if token matches name', () => {
      expect(matchesAnySearchToken(mockProduct, ['laptop'])).toBe(true);
    });

    test('should return true if token matches description', () => {
      expect(matchesAnySearchToken(mockProduct, ['performance'])).toBe(true);
    });

    test('should return true if token matches EAN', () => {
      expect(matchesAnySearchToken(mockProduct, ['123456789'])).toBe(true);
    });

    test('should return true if token matches ID', () => {
      expect(matchesAnySearchToken(mockProduct, ['1'])).toBe(true);
    });

    test('should return false if no tokens match', () => {
      expect(matchesAnySearchToken(mockProduct, ['phone', 'tablet'])).toBe(false);
    });

    test('should return true if at least one token matches', () => {
      expect(matchesAnySearchToken(mockProduct, ['phone', 'laptop'])).toBe(true);
    });
  });

  describe('matchesAllSearchTokens', () => {
    const mockProduct = {
      name: 'Laptop Computer',
      description: 'High performance laptop',
      ean: '123456789',
      id: 1
    };

    test('should return false for empty tokens', () => {
      expect(matchesAllSearchTokens(mockProduct, [])).toBe(false);
    });

    test('should return false for null product', () => {
      expect(matchesAllSearchTokens(null, ['laptop'])).toBe(false);
    });

    test('should return true if all tokens match', () => {
      expect(matchesAllSearchTokens(mockProduct, ['laptop', 'computer'])).toBe(true);
    });

    test('should return false if not all tokens match', () => {
      expect(matchesAllSearchTokens(mockProduct, ['laptop', 'phone'])).toBe(false);
    });

    test('should return true for single matching token', () => {
      expect(matchesAllSearchTokens(mockProduct, ['laptop'])).toBe(true);
    });
  });

  describe('filterProductsBySearch', () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Laptop Computer',
        description: 'High performance laptop',
        ean: '123456789'
      },
      {
        id: 2,
        name: 'Smartphone',
        description: 'Latest mobile phone',
        ean: '987654321'
      },
      {
        id: 3,
        name: 'Tablet',
        description: 'Portable device',
        ean: '555555555'
      }
    ];

    test('should return all products for empty query', () => {
      expect(filterProductsBySearch(mockProducts, '')).toEqual(mockProducts);
    });

    test('should return all products for null query', () => {
      expect(filterProductsBySearch(mockProducts, null)).toEqual(mockProducts);
    });

    test('should filter products by single token (strict match)', () => {
      const result = filterProductsBySearch(mockProducts, 'laptop');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    test('should filter products by multiple tokens (strict match)', () => {
      const result = filterProductsBySearch(mockProducts, 'laptop computer');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    test('should fallback to any match if strict match fails', () => {
      const result = filterProductsBySearch(mockProducts, 'phone mobile');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    test('should return empty array if no matches', () => {
      const result = filterProductsBySearch(mockProducts, 'nonexistent product');
      expect(result).toEqual([]);
    });

    test('should handle case insensitive search', () => {
      const result = filterProductsBySearch(mockProducts, 'LAPTOP');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });
});

