const Event = require('../models/Event');
const Guest = require('../models/Guest');

async function submitRsvp(req, res) {
  const { eventSlug, name, status, dietaryRestrictions, songRequest, companionsCount, extraAnswers } = req.body;

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

  const cleanExtraAnswers =
    extraAnswers && typeof extraAnswers === 'object' && !Array.isArray(extraAnswers)
      ? Object.fromEntries(
          Object.entries(extraAnswers)
            .slice(0, 20)
            .map(([key, value]) => [String(key).slice(0, 100), String(value).slice(0, 300)])
        )
      : {};

  const guest = await Guest.create({
    eventId: event._id,
    name,
    status: status || 'pendiente',
    dietaryRestrictions: dietaryRestrictions || '',
    songRequest: (songRequest || '').trim().slice(0, 150),
    companionsCount: companionsCount || 0,
    extraAnswers: cleanExtraAnswers,
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
