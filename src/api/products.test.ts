import request from 'supertest';
import { app } from '../app';
import { ProductService } from '../services/ProductService';

// Mock the ProductService
jest.mock('../services/ProductService');
const mockProductService = ProductService as jest.Mocked<typeof ProductService>;

describe('Product API - Filter by name', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      description: 'Latest Apple smartphone',
      price: 999.99,
      category: 'Electronics',
      inStock: true
    },
    {
      id: '2',
      name: 'Samsung Galaxy S23',
      description: 'Premium Android smartphone',
      price: 899.99,
      category: 'Electronics',
      inStock: true
    },
    {
      id: '3',
      name: 'MacBook Pro',
      description: 'Professional laptop',
      price: 2499.99,
      category: 'Electronics',
      inStock: false
    },
    {
      id: '4',
      name: 'iPad Air',
      description: 'Lightweight tablet',
      price: 599.99,
      category: 'Electronics',
      inStock: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/products with name filter', () => {
    it('should return all products when no name parameter is provided', async () => {
      (mockProductService.getAllProducts as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        total: mockProducts.length
      });
      expect(mockProductService.getAllProducts).toHaveBeenCalledWith();
    });

    it('should filter products by exact name match (case-insensitive)', async () => {
      const filteredProducts = [mockProducts[0]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=iphone 14 pro')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: filteredProducts,
        total: 1
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('iphone 14 pro');
    });

    it('should filter products by partial name match (case-insensitive)', async () => {
      const filteredProducts = [mockProducts[0], mockProducts[3]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=i')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: filteredProducts,
        total: 2
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('i');
    });

    it('should handle case-insensitive filtering correctly', async () => {
      const filteredProducts = [mockProducts[2]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=MACBOOK')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: filteredProducts,
        total: 1
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('MACBOOK');
    });

    it('should return empty array when no products match the name filter', async () => {
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/api/products?name=nonexistent')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        total: 0
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle empty string name parameter', async () => {
      (mockProductService.getAllProducts as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products?name=')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        total: mockProducts.length
      });
      expect(mockProductService.getAllProducts).toHaveBeenCalledWith();
    });

    it('should handle whitespace-only name parameter', async () => {
      (mockProductService.getAllProducts as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products?name=   ')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        total: mockProducts.length
      });
      expect(mockProductService.getAllProducts).toHaveBeenCalledWith();
    });

    it('should handle special characters in name parameter', async () => {
      const filteredProducts: any[] = [];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=@#$%')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        total: 0
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('@#$%');
    });

    it('should handle very long name parameter', async () => {
      const longName = 'a'.repeat(1000);
      const filteredProducts: any[] = [];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get(`/api/products?name=${longName}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        total: 0
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith(longName);
    });

    it('should handle multiple name parameters (use first one)', async () => {
      const filteredProducts = [mockProducts[0]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=iPhone&name=Samsung')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: filteredProducts,
        total: 1
      });
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('iPhone');
    });

    it('should maintain API response structure with filtering', async () => {
      const filteredProducts = [mockProducts[1]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=Samsung')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
      expect(response.body.data).toEqual(filteredProducts);
      expect(response.body.total).toBe(filteredProducts.length);
    });

    it('should return 500 when service throws an error', async () => {
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/products?name=iPhone')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error'
      });
    });

    it('should handle URL encoded name parameters', async () => {
      const filteredProducts = [mockProducts[0]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=iPhone%2014')
        .expect(200);

      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('iPhone 14');
      expect(response.body.data).toEqual(filteredProducts);
    });

    it('should handle unicode characters in name parameter', async () => {
      const unicodeName = 'Iphone 📱';
      const filteredProducts: any[] = [];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get(`/api/products?name=${encodeURIComponent(unicodeName)}`)
        .expect(200);

      expect(mockProductService.getProductsByName).toHaveBeenCalledWith(unicodeName);
    });
  });

  describe('Product filtering edge cases', () => {
    it('should handle concurrent requests with different name filters', async () => {
      const filter1Products = [mockProducts[0]];
      const filter2Products = [mockProducts[1]];
      
      (mockProductService.getProductsByName as jest.Mock)
        .mockResolvedValueOnce(filter1Products)
        .mockResolvedValueOnce(filter2Products);

      const [response1, response2] = await Promise.all([
        request(app).get('/api/products?name=iPhone'),
        request(app).get('/api/products?name=Samsung')
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.data).toEqual(filter1Products);
      expect(response2.body.data).toEqual(filter2Products);
    });

    it('should handle mixed case in partial matching', async () => {
      const filteredProducts = [mockProducts[0], mockProducts[3]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=iP')
        .expect(200);

      expect(response.body.data).toEqual(filteredProducts);
      expect(mockProductService.getProductsByName).toHaveBeenCalledWith('iP');
    });

    it('should preserve product object structure in filtered results', async () => {
      const filteredProducts = [mockProducts[0]];
      (mockProductService.getProductsByName as jest.Mock) = jest.fn().mockResolvedValue(filteredProducts);

      const response = await request(app)
        .get('/api/products?name=iPhone')
        .expect(200);

      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('inStock');
    });
  });
});