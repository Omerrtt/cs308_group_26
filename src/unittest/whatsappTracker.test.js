import {
  getWhatsAppClicks,
  saveWhatsAppClicks,
  incrementWhatsAppClick,
  getProductWhatsAppClicks,
  updateProductsWithWhatsAppClicks
} from '../utils/whatsappTracker';

// localStorage mock
let store = {};

const localStorageMock = {
  getItem: jest.fn((key) => {
    return store[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    store[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete store[key];
  }),
  clear: jest.fn(() => {
    store = {};
  })
};

// Mock localStorage before importing the module
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

describe('whatsappTracker utility functions', () => {
  beforeEach(() => {
    store = {};
    localStorageMock.getItem.mockImplementation((key) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    localStorageMock.removeItem.mockImplementation((key) => {
      delete store[key];
    });
    localStorageMock.clear.mockImplementation(() => {
      store = {};
    });
  });

  describe('getWhatsAppClicks', () => {
    test('should return empty object when localStorage is empty', () => {
      expect(getWhatsAppClicks()).toEqual({});
    });

    test('should return parsed clicks from localStorage', () => {
      const clicks = { 'product1': 5, 'product2': 3 };
      localStorageMock.setItem('whatsapp_clicks', JSON.stringify(clicks));
      expect(getWhatsAppClicks()).toEqual(clicks);
    });

    test('should return empty object on parse error', () => {
      localStorageMock.setItem('whatsapp_clicks', 'invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      expect(getWhatsAppClicks()).toEqual({});
      consoleSpy.mockRestore();
    });
  });

  describe('saveWhatsAppClicks', () => {
    test('should save clicks to localStorage', () => {
      const clicks = { 'product1': 5 };
      saveWhatsAppClicks(clicks);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'whatsapp_clicks',
        JSON.stringify(clicks)
      );
    });

    test('should handle save errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const clicks = { 'product1': 5 };
      expect(() => saveWhatsAppClicks(clicks)).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('incrementWhatsAppClick', () => {
    test('should increment click count for new product', () => {
      const result = incrementWhatsAppClick('product1');
      expect(result).toBe(1);
      expect(getWhatsAppClicks()).toEqual({ 'product1': 1 });
    });

    test('should increment existing click count', () => {
      localStorageMock.setItem('whatsapp_clicks', JSON.stringify({ 'product1': 5 }));
      const result = incrementWhatsAppClick('product1');
      expect(result).toBe(6);
      expect(getWhatsAppClicks()).toEqual({ 'product1': 6 });
    });

    test('should handle multiple products independently', () => {
      incrementWhatsAppClick('product1');
      incrementWhatsAppClick('product2');
      incrementWhatsAppClick('product1');
      expect(getWhatsAppClicks()).toEqual({ 'product1': 2, 'product2': 1 });
    });
  });

  describe('getProductWhatsAppClicks', () => {
    test('should return 0 for non-existent product', () => {
      expect(getProductWhatsAppClicks('product1')).toBe(0);
    });

    test('should return click count for existing product', () => {
      localStorageMock.setItem('whatsapp_clicks', JSON.stringify({ 'product1': 5 }));
      expect(getProductWhatsAppClicks('product1')).toBe(5);
    });

    test('should return 0 when clicks object is empty', () => {
      expect(getProductWhatsAppClicks('product1')).toBe(0);
    });
  });

  describe('updateProductsWithWhatsAppClicks', () => {
    test('should add whatsappClicks property to products', () => {
      const products = [
        { id: 'product1', name: 'Product 1' },
        { id: 'product2', name: 'Product 2' }
      ];
      incrementWhatsAppClick('product1');
      incrementWhatsAppClick('product1');
      incrementWhatsAppClick('product2');
      
      const result = updateProductsWithWhatsAppClicks(products);
      expect(result[0].whatsappClicks).toBe(2);
      expect(result[1].whatsappClicks).toBe(1);
    });

    test('should set whatsappClicks to 0 for products without clicks', () => {
      const products = [
        { id: 'product1', name: 'Product 1' },
        { id: 'product2', name: 'Product 2' }
      ];
      
      const result = updateProductsWithWhatsAppClicks(products);
      expect(result[0].whatsappClicks).toBe(0);
      expect(result[1].whatsappClicks).toBe(0);
    });

    test('should preserve other product properties', () => {
      const products = [
        { id: 'product1', name: 'Product 1', price: 100 }
      ];
      incrementWhatsAppClick('product1');
      
      const result = updateProductsWithWhatsAppClicks(products);
      expect(result[0].name).toBe('Product 1');
      expect(result[0].price).toBe(100);
      expect(result[0].whatsappClicks).toBe(1);
    });

    test('should handle empty products array', () => {
      expect(updateProductsWithWhatsAppClicks([])).toEqual([]);
    });
  });
});

