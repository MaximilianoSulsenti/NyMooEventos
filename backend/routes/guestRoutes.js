const express = require('express');
const { submitRsvp, getGuestsByEvent } = require('../controllers/guestController');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/rsvp', publicWriteLimiter, submitRsvp);
router.get('/event/:eventId', requireAuth, requireEventOwnership, getGuestsByEvent);

module.exports = router;
