const express = require('express');
const {
  submitRsvp,
  getGuestsByEvent,
  getGuestsForClient,
  createPremiumGuest,
  deleteGuest,
  createPremiumGuestForClient,
  deletePremiumGuestForClient,
  lookupGuestByPasscode,
  searchGuestByName,
} = require('../controllers/guestController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { requireClientToken } = require('../middleware/clientAccess');
const { publicWriteLimiter, publicLookupLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/rsvp', publicWriteLimiter, submitRsvp);
router.get('/event/:eventId', requireAuth, requireEventOwnership, getGuestsByEvent);
router.get('/client/:eventSlug', requireClientToken, getGuestsForClient);

// Plan premium: gestión de la lista de invitados VIP -- vía admin (login) o
// vía el cliente desde su panel de estadísticas sin login (clientAccessToken).
router.post('/event/:eventId/premium', requireAuth, requireAdmin, createPremiumGuest);
router.delete('/:guestId', requireAuth, requireAdmin, deleteGuest);
router.post('/client/:eventSlug/premium', requireClientToken, createPremiumGuestForClient);
router.delete('/client/:eventSlug/:guestId', requireClientToken, deletePremiumGuestForClient);

// Plan premium: acceso público sin login para que el invitado encuentre su
// propia invitación (por link con código, o buscando su nombre).
router.get('/lookup/:eventSlug/:passcode', publicLookupLimiter, lookupGuestByPasscode);
router.get('/search/:eventSlug', publicLookupLimiter, searchGuestByName);

module.exports = router;
