const express = require('express');
const {
  getStats,
  getMe,
  signMatchPhoto,
  createProfile,
  updateProfile,
  deleteOwnProfile,
  getFeed,
  getGrid,
  postAction,
  getMyMatches,
  listProfilesForAdmin,
  listProfilesForClient,
  updateProfileStatus,
  updateProfileStatusForClient,
  deleteProfileAsAdmin,
  deleteProfileForClient,
} = require('../controllers/matchController');
const { resolveMatchEvent, requireMatchProfile } = require('../middleware/matchAccess');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { requireClientToken } = require('../middleware/clientAccess');
const { matchOnboardingLimiter, matchReadLimiter, matchActionLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Organizador -- rutas con prefijo literal, declaradas ANTES que
// /:eventSlug/... de más abajo (mismo patrón ya usado en taskRoutes.js),
// porque si no Express captura "event"/"client" como si fueran el slug.
router.get('/event/:eventId/admin', requireAuth, requireEventOwnership, listProfilesForAdmin);
router.patch('/event/:eventId/profiles/:profileId/status', requireAuth, requireEventOwnership, updateProfileStatus);
router.delete('/event/:eventId/profiles/:profileId', requireAuth, requireEventOwnership, deleteProfileAsAdmin);

router.get('/client/:eventSlug/admin', requireClientToken, listProfilesForClient);
router.patch('/client/:eventSlug/profiles/:profileId/status', requireClientToken, updateProfileStatusForClient);
router.delete('/client/:eventSlug/profiles/:profileId', requireClientToken, deleteProfileForClient);

// Invitado -- público, sin login. resolveMatchEvent valida el módulo;
// requireMatchProfile valida el token que cada celular guarda localmente.
router.get('/:eventSlug/stats', matchReadLimiter, resolveMatchEvent, getStats);
router.get('/:eventSlug/me', matchReadLimiter, resolveMatchEvent, getMe);
router.get('/:eventSlug/sign-photo', matchOnboardingLimiter, resolveMatchEvent, signMatchPhoto);
router.post('/:eventSlug/profile', matchOnboardingLimiter, resolveMatchEvent, createProfile);
router.patch('/:eventSlug/profile', matchOnboardingLimiter, resolveMatchEvent, requireMatchProfile, updateProfile);
router.delete('/:eventSlug/profile', matchOnboardingLimiter, resolveMatchEvent, requireMatchProfile, deleteOwnProfile);
router.get('/:eventSlug/feed', matchReadLimiter, resolveMatchEvent, requireMatchProfile, getFeed);
router.get('/:eventSlug/grid', matchReadLimiter, resolveMatchEvent, requireMatchProfile, getGrid);
router.get('/:eventSlug/matches', matchReadLimiter, resolveMatchEvent, requireMatchProfile, getMyMatches);
router.post('/:eventSlug/action', matchActionLimiter, resolveMatchEvent, requireMatchProfile, postAction);

module.exports = router;
