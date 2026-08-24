const express = require('express');
const { createOrder, createManualOrder, listOrders, updateOrderStatus } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', publicWriteLimiter, createOrder);
router.post('/manual', requireAuth, requireAdmin, createManualOrder);
router.get('/', requireAuth, requireAdmin, listOrders);
router.patch('/:orderId/status', requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;
