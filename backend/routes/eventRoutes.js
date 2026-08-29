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
  updateTables,
  updateTablesForClient,
  getTablesForClient,
  updatePlaylist,
  updatePlaylistForClient,
  getPlaylistForClient,
  signAppearanceUpload,
  updateModerationModeForClient,
  updatePlaybackSpeedForClient,
  updateMaxLivePhotosForClient,
  updateLiveControlsForClient,
  duplicateDuo,
  regenerateClientToken,
  deleteEvent,
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
router.put('/:eventId/tables', requireAuth, requireEventOwnership, updateTables);
router.put('/:eventId/playlist', requireAuth, requireEventOwnership, updatePlaylist);
router.get('/:eventId/appearance/sign', requireAuth, requireEventOwnership, signAppearanceUpload);
router.post('/:eventId/duplicate-duo', requireAuth, requireEventOwnership, duplicateDuo);
router.post('/:eventId/regenerate-token', requireAuth, requireEventOwnership, regenerateClientToken);
router.delete('/:eventId', requireAuth, requireEventOwnership, deleteEvent);
router.patch('/client/:eventSlug/moderation-mode', requireClientToken, updateModerationModeForClient);
router.patch('/client/:eventSlug/playback-speed', requireClientToken, updatePlaybackSpeedForClient);
router.patch('/client/:eventSlug/max-live-photos', requireClientToken, updateMaxLivePhotosForClient);
router.patch('/client/:eventSlug/live-controls', requireClientToken, updateLiveControlsForClient);
router.get('/client/:eventSlug/tables', requireClientToken, getTablesForClient);
router.put('/client/:eventSlug/tables', requireClientToken, updateTablesForClient);
router.get('/client/:eventSlug/playlist', requireClientToken, getPlaylistForClient);
router.put('/client/:eventSlug/playlist', requireClientToken, updatePlaylistForClient);

module.exports = router;
