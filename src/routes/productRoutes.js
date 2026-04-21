const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// GET /api/products - Get all products with optional name filter
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product by ID
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;