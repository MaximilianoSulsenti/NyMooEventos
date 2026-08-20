const express = require('express');
const {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
  updateAppearance,
  updateEnvelopeSettings,
  updateSections,
  signAppearanceUpload,
  updateModerationModeForClient,
} = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { requireClientToken } = require('../middleware/clientAccess');

const router = express.Router();

router.get('/slug/:eventSlug', getEventBySlug);

router.get('/', requireAuth, listMyEvents);
router.post('/', requireAuth, createEvent);
router.get('/:eventId', requireAuth, requireEventOwnership, getEventById);
router.patch('/:eventId/modules', requireAuth, requireAdmin, updateEventModules);
router.patch('/:eventId/appearance', requireAuth, requireEventOwnership, updateAppearance);
router.patch('/:eventId/envelope', requireAuth, requireEventOwnership, updateEnvelopeSettings);
router.patch('/:eventId/sections', requireAuth, requireEventOwnership, updateSections);
router.get('/:eventId/appearance/sign', requireAuth, requireEventOwnership, signAppearanceUpload);
router.patch('/client/:eventSlug/moderation-mode', requireClientToken, updateModerationModeForClient);

module.exports = router;
