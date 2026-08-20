const Event = require('../models/Event');
const Guest = require('../models/Guest');

async function submitRsvp(req, res) {
  const { eventSlug, name, status, dietaryRestrictions, companionsCount } = req.body;

  if (!eventSlug || !name) {
    return res.status(400).json({ message: 'eventSlug y name son requeridos' });
  }

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.guestControl) {
    return res.status(403).json({ message: 'El módulo de control de invitados no está activo para este evento' });
  }

  const guest = await Guest.create({
    eventId: event._id,
    name,
    status: status || 'pendiente',
    dietaryRestrictions: dietaryRestrictions || '',
    companionsCount: companionsCount || 0,
  });

  res.status(201).json(guest);
}

async function getGuestsByEvent(req, res) {
  const { eventId } = req.params;

  const guests = await Guest.find({ eventId }).sort({ createdAt: -1 });
  res.json(guests);
}

async function getGuestsForClient(req, res) {
  const guests = await Guest.find({ eventId: req.event._id }).sort({ createdAt: -1 });
  res.json(guests);
}

module.exports = { submitRsvp, getGuestsByEvent, getGuestsForClient };
