const Event = require('../models/Event');
const { isAdminEmail } = require('./admin');

async function requireEventOwnership(req, res, next) {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const isOwner = event.organizerId.toString() === req.user._id.toString();
  if (!isOwner && !isAdminEmail(req.user.email)) {
    return res.status(403).json({ message: 'No tenés permiso sobre este evento' });
  }

  req.event = event;
  next();
}

module.exports = { requireEventOwnership };
