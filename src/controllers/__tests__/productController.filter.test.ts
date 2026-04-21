import request from 'supertest';
import express from 'express';
import productController from '../productController';
import database from '../../../database';

// Mock the database
jest.mock('../../../database');
const mockDatabase = database as jest.Mocked<typeof database>;

const app = express();
app.use(express.json());
app.get('/products', productController.getAllProducts);

describe('ProductController - Name Filter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Filter parameter acceptance', () => {
    it('should accept name parameter from query string', async () => {
      const mockProducts = [
        { id: 1, name: 'iPhone 15', description: 'Latest iPhone', price: 999.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      await request(app)
        .get('/products?name=iPhone')
        .expect(200);

      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('iPhone');
    });

    it('should handle empty name parameter', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1', price: 99.99, category: 'Category 1' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      await request(app)
        .get('/products?name=')
        .expect(200);

      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('');
    });

    it('should handle multiple query parameters with name filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', description: 'Gaming laptop', price: 1299.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      await request(app)
        .get('/products?name=laptop&category=electronics&sort=price')
        .expect(200);

      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('laptop');
    });
  });

  describe('Case-insensitive partial matching', () => {
    it('should filter products with case-insensitive matching - lowercase query', async () => {
      const mockProducts = [
        { id: 1, name: 'MacBook Pro', description: 'Apple laptop', price: 1999.99, category: 'Electronics' },
        { id: 2, name: 'MacBook Air', description: 'Lightweight laptop', price: 1299.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=macbook')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 2,
        message: 'Products retrieved successfully'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('macbook');
    });

    it('should filter products with case-insensitive matching - uppercase query', async () => {
      const mockProducts = [
        { id: 1, name: 'iPhone 15 Pro', description: 'Latest iPhone', price: 1199.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=IPHONE')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 1,
        message: 'Products retrieved successfully'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('IPHONE');
    });

    it('should filter products with case-insensitive matching - mixed case query', async () => {
      const mockProducts = [
        { id: 1, name: 'Samsung Galaxy S24', description: 'Android smartphone', price: 899.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=GaLaXy')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 1,
        message: 'Products retrieved successfully'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('GaLaXy');
    });

    it('should perform partial matching on product names', async () => {
      const mockProducts = [
        { id: 1, name: 'Wireless Bluetooth Headphones', description: 'High-quality audio', price: 199.99, category: 'Electronics' },
        { id: 2, name: 'Wired Gaming Headset', description: 'Gaming audio', price: 89.99, category: 'Gaming' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=head')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 2,
        message: 'Products retrieved successfully'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('head');
    });

    it('should match products with substring in the middle', async () => {
      const mockProducts = [
        { id: 1, name: 'Ultra High Definition Monitor', description: '4K display', price: 399.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=high')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('high');
    });
  });

  describe('Special characters and spaces handling', () => {
    it('should handle spaces in product name filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Coffee Machine Deluxe', description: 'Premium coffee maker', price: 299.99, category: 'Kitchen' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Coffee Machine')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Coffee Machine');
    });

    it('should handle URL encoded spaces in filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Air Fryer Pro', description: 'Healthy cooking appliance', price: 149.99, category: 'Kitchen' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Air%20Fryer')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Air Fryer');
    });

    it('should handle ampersand (&) character in filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Salt & Pepper Shaker Set', description: 'Kitchen essentials', price: 24.99, category: 'Kitchen' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Salt & Pepper')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Salt & Pepper');
    });

    it('should handle URL encoded ampersand in filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Books & Magazines Rack', description: 'Storage solution', price: 79.99, category: 'Furniture' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Books%20%26%20Magazines')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Books & Magazines');
    });

    it('should handle special characters like hyphens and apostrophes', async () => {
      const mockProducts = [
        { id: 1, name: "Men's T-Shirt Collection", description: "Fashion apparel", price: 39.99, category: 'Clothing' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Men\'s T-Shirt')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith("Men's T-Shirt");
    });

    it('should handle numbers and special characters combined', async () => {
      const mockProducts = [
        { id: 1, name: 'USB-C 3.0 Cable (6ft)', description: 'Fast charging cable', price: 19.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=USB-C 3.0')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('USB-C 3.0');
    });

    it('should handle parentheses and brackets', async () => {
      const mockProducts = [
        { id: 1, name: 'Gaming Chair (Ergonomic)', description: 'Comfortable seating', price: 249.99, category: 'Furniture' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=(Ergonomic)')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('(Ergonomic)');
    });
  });

  describe('Empty result handling', () => {
    it('should return empty array when no products match the filter', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=nonexistentproduct')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'No products found'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('nonexistentproduct');
    });

    it('should return appropriate message for empty results with specific filter', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=xyz123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
      expect(response.body.message).toBe('No products found');
    });

    it('should return empty result for filter with only special characters', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=@#$%')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('@#$%');
    });
  });

  describe('Optional filter parameter', () => {
    it('should return all products when name parameter is not provided', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1', price: 99.99, category: 'Category 1' },
        { id: 2, name: 'Product 2', description: 'Description 2', price: 199.99, category: 'Category 2' },
        { id: 3, name: 'Product 3', description: 'Description 3', price: 299.99, category: 'Category 3' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 3,
        message: 'Products retrieved successfully'
      });
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(undefined);
    });

    it('should return all products when only other parameters are provided', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1', price: 99.99, category: 'Electronics' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?category=electronics&sort=price')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Response format consistency', () => {
    it('should maintain consistent response format for filtered results', async () => {
      const mockProducts = [
        { id: 1, name: 'Filtered Product', description: 'Test description', price: 49.99, category: 'Test' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=filtered')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.count).toBe('number');
      expect(typeof response.body.message).toBe('string');
    });

    it('should maintain consistent response format for empty filtered results', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=notfound')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data', []);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('message', 'No products found');
    });

    it('should return 200 status code for all valid filter requests', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      await request(app)
        .get('/products?name=test')
        .expect(200);

      await request(app)
        .get('/products?name=')
        .expect(200);

      await request(app)
        .get('/products')
        .expect(200);
    });
  });

  describe('Error handling with filters', () => {
    it('should handle database errors gracefully when filter is applied', async () => {
      mockDatabase.getAllProducts.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/products?name=test')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve products'
      });
    });

    it('should handle database timeout errors with filter', async () => {
      mockDatabase.getAllProducts.mockRejectedValue(new Error('Query timeout'));

      const response = await request(app)
        .get('/products?name=complex filter')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long filter strings', async () => {
      const longFilterName = 'a'.repeat(1000);
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get(`/products?name=${longFilterName}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(longFilterName);
    });

    it('should handle filter with only whitespace', async () => {
      mockDatabase.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=%20%20%20')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('   ');
    });

    it('should handle multiple consecutive spaces in filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Product   With   Spaces', description: 'Test product', price: 99.99, category: 'Test' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Product   With   Spaces')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Product   With   Spaces');
    });

    it('should handle Unicode characters in filter', async () => {
      const mockProducts = [
        { id: 1, name: 'Café Latté Machine ☕', description: 'Coffee maker', price: 199.99, category: 'Kitchen' }
      ];
      
      mockDatabase.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Café')
        .expect(200);

      expect(response.body.data).toEqual(mockProducts);
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Café');
    });
  });
});