const express = require('express');
const { submitRsvp, getGuestsByEvent, getGuestsForClient } = require('../controllers/guestController');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { requireClientToken } = require('../middleware/clientAccess');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/rsvp', publicWriteLimiter, submitRsvp);
router.get('/event/:eventId', requireAuth, requireEventOwnership, getGuestsByEvent);
router.get('/client/:eventSlug', requireClientToken, getGuestsForClient);

module.exports = router;
