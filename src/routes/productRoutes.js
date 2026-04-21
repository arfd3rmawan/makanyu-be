const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllProducts);                             // public
router.get('/:id', getProductById);                         // public
router.post('/', protect, adminOnly, createProduct);        // admin only
router.put('/:id', protect, adminOnly, updateProduct);      // admin only
router.delete('/:id', protect, adminOnly, deleteProduct);   // admin only

module.exports = router;
