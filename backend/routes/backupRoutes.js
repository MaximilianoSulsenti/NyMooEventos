const express = require('express');
const { runBackup, getBackupDownloadUrl } = require('../controllers/backupController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Disparado por el workflow programado de GitHub Actions, protegido por un
// secreto compartido (no por JWT, porque no hay un usuario logueado del otro
// lado). El rate limiter es defensa extra contra intentos de adivinar el secreto.
router.post('/run', authLimiter, runBackup);

// Solo el equipo de NyMoo puede pedir la URL para descargar el último backup.
router.get('/download-url', requireAuth, requireAdmin, getBackupDownloadUrl);

module.exports = router;
