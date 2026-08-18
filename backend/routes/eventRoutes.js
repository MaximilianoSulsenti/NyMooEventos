const express = require('express');
const {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
} = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { requireEventOwnership } = require('../middleware/eventOwnership');

const router = express.Router();

router.get('/slug/:eventSlug', getEventBySlug);

router.get('/', requireAuth, listMyEvents);
router.post('/', requireAuth, createEvent);
router.get('/:eventId', requireAuth, requireEventOwnership, getEventById);
router.patch('/:eventId/modules', requireAuth, requireAdmin, updateEventModules);

module.exports = router;
