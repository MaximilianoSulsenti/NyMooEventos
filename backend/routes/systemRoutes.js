// Endpoints varios de estado del sistema, para el panel de administración
// -- separado de orderRoutes.js porque no tiene que ver con pedidos, es
// infraestructura (ver systemController.js).
const express = require('express');
const { getCloudinaryUsageStatus } = require('../controllers/systemController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.get('/cloudinary-usage', requireAuth, requireAdmin, getCloudinaryUsageStatus);

module.exports = router;
