const request = require('supertest');
const express = require('express');
const productController = require('../productController');
const database = require('../../../database');

// Mock the database
jest.mock('../../../database');

const app = express();
app.use(express.json());
app.get('/products', productController.getAllProducts);
app.get('/products/:id', productController.getProductById);
app.post('/products', productController.createProduct);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);

describe('ProductController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /products', () => {
    it('should return all products when no filter is provided', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop Computer', description: 'High-performance laptop', price: 999.99, category: 'Electronics' },
        { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'Electronics' }
      ];
      
      database.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 2,
        message: 'Products retrieved successfully'
      });
      expect(database.getAllProducts).toHaveBeenCalledWith(undefined);
    });

    it('should filter products by name (case-insensitive partial matching)', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop Computer', description: 'High-performance laptop', price: 999.99, category: 'Electronics' }
      ];
      
      database.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=laptop')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 1,
        message: 'Products retrieved successfully'
      });
      expect(database.getAllProducts).toHaveBeenCalledWith('laptop');
    });

    it('should handle special characters and spaces in product name filter', async () => {
      const mockProducts = [
        { id: 3, name: 'Coffee & Tea Mug', description: 'Special mug', price: 15.99, category: 'Kitchen' }
      ];
      
      database.getAllProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products?name=Coffee%20%26%20Tea')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 1,
        message: 'Products retrieved successfully'
      });
      expect(database.getAllProducts).toHaveBeenCalledWith('Coffee & Tea');
    });

    it('should return empty result when no products match the filter', async () => {
      database.getAllProducts.mockResolvedValue([]);

      const response = await request(app)
        .get('/products?name=nonexistent')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'No products found'
      });
      expect(database.getAllProducts).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle database errors gracefully', async () => {
      database.getAllProducts.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/products')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve products'
      });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by ID', async () => {
      const mockProduct = { id: 1, name: 'Laptop Computer', description: 'High-performance laptop', price: 999.99, category: 'Electronics' };
      
      database.getProductById.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/products/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      });
      expect(database.getProductById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when product not found', async () => {
      database.getProductById.mockResolvedValue(null);

      const response = await request(app)
        .get('/products/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Not found',
        message: 'Product not found'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/products/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Bad request',
        message: 'Valid product ID is required'
      });
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = { name: 'New Product', description: 'Test product', price: 99.99, category: 'Test' };
      const createdProduct = { id: 1, ...newProduct };
      
      database.createProduct.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: createdProduct,
        message: 'Product created successfully'
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/products')
        .send({ description: 'Missing name and price' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Bad request',
        message: 'Name and price are required'
      });
    });

    it('should return 400 for invalid price', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Test Product', price: 'invalid' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Bad request',
        message: 'Price must be a positive number'
      });
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const existingProduct = { id: 1, name: 'Old Product', description: 'Old description', price: 50.00, category: 'Old' };
      const updatedData = { name: 'Updated Product', description: 'Updated description', price: 75.00, category: 'Updated' };
      const updatedProduct = { id: 1, ...updatedData };
      
      database.getProductById.mockResolvedValue(existingProduct);
      database.updateProduct.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put('/products/1')
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    });

    it('should return 404 when trying to update non-existent product', async () => {
      database.getProductById.mockResolvedValue(null);

      const response = await request(app)
        .put('/products/999')
        .send({ name: 'Updated Product', price: 75.00 })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Not found',
        message: 'Product not found'
      });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      const existingProduct = { id: 1, name: 'Product to Delete', price: 50.00 };
      
      database.getProductById.mockResolvedValue(existingProduct);
      database.deleteProduct.mockResolvedValue({ deletedId: 1, changes: 1 });

      const response = await request(app)
        .delete('/products/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Product deleted successfully'
      });
    });

    it('should return 404 when trying to delete non-existent product', async () => {
      database.getProductById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/products/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Not found',
        message: 'Product not found'
      });
    });
  });
});