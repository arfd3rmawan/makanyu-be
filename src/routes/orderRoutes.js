const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);                               // logged-in users
router.get('/', protect, getMyOrders);                                // logged-in users
router.get('/all', protect, adminOnly, getAllOrders);                  // admin only
router.put('/:id/status', protect, adminOnly, updateOrderStatus);     // admin only

module.exports = router;
