import { Request, Response } from 'express';
import * as database from '../database';
import ProductController from '../productController';

// Mock the database module
jest.mock('../database', () => ({
  getAllProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn()
}));

const mockDatabase = database as jest.Mocked<typeof database>;

describe('ProductController - Filter Products by Name', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const sampleProducts = [
    { id: 1, name: 'Laptop Computer', description: 'High-performance laptop', price: 999.99, category: 'Electronics', created_at: '2023-01-01' },
    { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'Electronics', created_at: '2023-01-02' },
    { id: 3, name: 'Coffee Mug', description: 'Ceramic coffee mug', price: 12.99, category: 'Kitchen', created_at: '2023-01-03' },
    { id: 4, name: 'Desk Lamp', description: 'LED desk lamp', price: 45.99, category: 'Office', created_at: '2023-01-04' },
    { id: 5, name: 'Notebook', description: 'Lined notebook', price: 8.99, category: 'Stationery', created_at: '2023-01-05' }
  ];

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    
    mockRequest = {
      query: {},
      params: {},
      body: {}
    };
    
    mockResponse = {
      json: jsonMock,
      status: statusMock
    };

    jest.clearAllMocks();
  });

  describe('getAllProducts with name filter', () => {
    it('should return all products when no name filter is provided', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue(sampleProducts);
      mockRequest.query = {};

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(undefined);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleProducts,
        count: 5,
        filter: null
      });
    });

    it('should filter products by name parameter (case-insensitive partial matching)', async () => {
      // Arrange
      const filteredProducts = [sampleProducts[0]]; // Laptop Computer
      mockDatabase.getAllProducts.mockResolvedValue(filteredProducts);
      mockRequest.query = { name: 'laptop' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('laptop');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: filteredProducts,
        count: 1,
        filter: { name: 'laptop' }
      });
    });

    it('should perform case-insensitive partial matching on product names', async () => {
      // Arrange
      const filteredProducts = [sampleProducts[1]]; // Wireless Mouse
      mockDatabase.getAllProducts.mockResolvedValue(filteredProducts);
      mockRequest.query = { name: 'MOUSE' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('MOUSE');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: filteredProducts,
        count: 1,
        filter: { name: 'MOUSE' }
      });
    });

    it('should return multiple products when partial name matches multiple items', async () => {
      // Arrange
      const filteredProducts = [
        sampleProducts[0], // Laptop Computer
        sampleProducts[1]  // Wireless Mouse (both contain letters)
      ];
      mockDatabase.getAllProducts.mkResolvedValue(filteredProducts);
      mockRequest.query = { name: 'e' }; // Common letter in multiple products

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('e');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: filteredProducts,
        count: 2,
        filter: { name: 'e' }
      });
    });

    it('should return empty results when no products match the filter', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue([]);
      mockRequest.query = { name: 'nonexistent' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('nonexistent');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        filter: { name: 'nonexistent' }
      });
    });

    it('should handle empty string filter parameter', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue(sampleProducts);
      mockRequest.query = { name: '' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleProducts,
        count: 5,
        filter: { name: '' }
      });
    });

    it('should handle whitespace-only filter parameter', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue([]);
      mockRequest.query = { name: '   ' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('   ');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        filter: { name: '   ' }
      });
    });

    it('should handle special characters in filter parameter', async () => {
      // Arrange
      const specialProduct = [{ ...sampleProducts[0], name: 'Product-123 & Co.' }];
      mockDatabase.getAllProducts.mockResolvedValue(specialProduct);
      mockRequest.query = { name: 'Product-123' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('Product-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: specialProduct,
        count: 1,
        filter: { name: 'Product-123' }
      });
    });

    it('should maintain existing response format and structure when filtering', async () => {
      // Arrange
      const filteredProducts = [sampleProducts[2]]; // Coffee Mug
      mockDatabase.getAllProducts.mockResolvedValue(filteredProducts);
      mockRequest.query = { name: 'coffee' };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      const expectedResponse = {
        success: true,
        data: filteredProducts,
        count: 1,
        filter: { name: 'coffee' }
      };
      
      expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
      expect(statusMock).not.toHaveBeenCalled(); // Should use default 200 status
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockDatabase.getAllProducts.mockRejectedValue(dbError);
      mockRequest.query = { name: 'laptop' };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch products'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching products:', dbError);
      
      consoleSpy.mockRestore();
    });

    it('should ignore additional query parameters and only use name filter', async () => {
      // Arrange
      const filteredProducts = [sampleProducts[4]]; // Notebook
      mockDatabase.getAllProducts.mockResolvedValue(filteredProducts);
      mockRequest.query = { 
        name: 'notebook',
        category: 'Electronics', // Should be ignored
        price: '100' // Should be ignored
      };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith('notebook');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: filteredProducts,
        count: 1,
        filter: { name: 'notebook' }
      });
    });

    it('should handle null name parameter as no filter', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue(sampleProducts);
      mockRequest.query = { name: null };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(null);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleProducts,
        count: 5,
        filter: { name: null }
      });
    });

    it('should handle undefined name parameter as no filter', async () => {
      // Arrange
      mockDatabase.getAllProducts.mockResolvedValue(sampleProducts);
      mockRequest.query = { name: undefined };

      // Act
      await ProductController.getAllProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDatabase.getAllProducts).toHaveBeenCalledWith(undefined);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleProducts,
        count: 5,
        filter: null
      });
    });
  });
});