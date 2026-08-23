const express = require('express');
const {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
  updateAppearance,
  updateEnvelopeSettings,
  updateMyBranding,
  updateClientBranding,
  updateUploadPageSettings,
  updateGallerySettings,
  updateMusicSettings,
  updateRsvpSettings,
  updateSections,
  signAppearanceUpload,
  updateModerationModeForClient,
  updatePlaybackSpeedForClient,
  updateMaxLivePhotosForClient,
  updateVipMessageTemplateForClient,
  updateLiveControlsForClient,
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
router.patch('/:eventId/branding/mine', requireAuth, requireAdmin, updateMyBranding);
router.patch('/:eventId/branding/client', requireAuth, requireEventOwnership, updateClientBranding);
router.patch('/:eventId/upload-page', requireAuth, requireEventOwnership, updateUploadPageSettings);
router.patch('/:eventId/gallery-settings', requireAuth, requireEventOwnership, updateGallerySettings);
router.patch('/:eventId/music', requireAuth, requireEventOwnership, updateMusicSettings);
router.patch('/:eventId/rsvp-settings', requireAuth, requireEventOwnership, updateRsvpSettings);
router.patch('/:eventId/sections', requireAuth, requireEventOwnership, updateSections);
router.get('/:eventId/appearance/sign', requireAuth, requireEventOwnership, signAppearanceUpload);
router.patch('/client/:eventSlug/moderation-mode', requireClientToken, updateModerationModeForClient);
router.patch('/client/:eventSlug/playback-speed', requireClientToken, updatePlaybackSpeedForClient);
router.patch('/client/:eventSlug/max-live-photos', requireClientToken, updateMaxLivePhotosForClient);
router.patch('/client/:eventSlug/vip-message-template', requireClientToken, updateVipMessageTemplateForClient);
router.patch('/client/:eventSlug/live-controls', requireClientToken, updateLiveControlsForClient);

module.exports = router;
