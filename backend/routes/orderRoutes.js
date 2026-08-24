const express = require('express');
const {
  createOrder,
  createSharedOrderForm,
  createManualOrder,
  listOrders,
  updateOrderStatus,
  updateOrderArchive,
} = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', publicWriteLimiter, createOrder);
router.post('/self-fill', publicWriteLimiter, createSharedOrderForm);
router.post('/manual', requireAuth, requireAdmin, createManualOrder);
router.get('/', requireAuth, requireAdmin, listOrders);
router.patch('/:orderId/status', requireAuth, requireAdmin, updateOrderStatus);
router.patch('/:orderId/archive', requireAuth, requireAdmin, updateOrderArchive);

module.exports = router;
