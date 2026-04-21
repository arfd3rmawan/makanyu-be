const database = require('../../database');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { name } = req.query;
      const products = await database.getAllProducts(name);
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        message: products.length === 0 ? 'No products found' : 'Products retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve products'
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Valid product ID is required'
        });
      }

      const product = await database.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve product'
      });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, description, price, category } = req.body;
      
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Name and price are required'
        });
      }

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Price must be a positive number'
        });
      }

      const productData = {
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parseFloat(price),
        category: category ? category.trim() : null
      };

      const product = await database.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create product'
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, category } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Valid product ID is required'
        });
      }

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Name and price are required'
        });
      }

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Price must be a positive number'
        });
      }

      // Check if product exists
      const existingProduct = await database.getProductById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Product not found'
        });
      }

      const productData = {
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parseFloat(price),
        category: category ? category.trim() : null
      };

      const product = await database.updateProduct(parseInt(id), productData);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update product'
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Valid product ID is required'
        });
      }

      // Check if product exists
      const existingProduct = await database.getProductById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Product not found'
        });
      }

      await database.deleteProduct(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: { id: parseInt(id) },
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete product'
      });
    }
  }
}

module.exports = new ProductController();