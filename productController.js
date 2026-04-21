const database = require('./database');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { name } = req.query;
      const products = await database.getAllProducts(name);
      
      res.json({
        success: true,
        data: products,
        count: products.length,
        filter: name ? { name } : null
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch products'
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await database.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} does not exist`
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch product'
      });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, description, price, category } = req.body;
      
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Name and price are required fields'
        });
      }

      const product = await database.createProduct({ name, description, price, category });
      
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
      
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Name and price are required fields'
        });
      }

      const existingProduct = await database.getProductById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} does not exist`
        });
      }

      const product = await database.updateProduct(parseInt(id), { name, description, price, category });
      
      res.json({
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
      
      const existingProduct = await database.getProductById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} does not exist`
        });
      }

      await database.deleteProduct(parseInt(id));
      
      res.json({
        success: true,
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