// Endpoints varios de estado del sistema, para el panel de administración
// -- separado de orderRoutes.js porque no tiene que ver con pedidos, es
// infraestructura (ver systemController.js).
const express = require('express');
const { getCloudinaryUsageStatus, runReminderSweepNow } = require('../controllers/systemController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/cloudinary-usage', requireAuth, requireAdmin, getCloudinaryUsageStatus);
// Disparado por GitHub Actions (.github/workflows/reminder-sweep.yml), no
// por un usuario logueado -- protegido por secreto compartido, no por JWT,
// mismo criterio que /api/backup/run.
router.post('/run-reminder-sweep', authLimiter, runReminderSweepNow);

module.exports = router;
