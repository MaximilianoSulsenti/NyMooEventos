const Event = require('../models/Event');
const Guest = require('../models/Guest');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  // Trae "¿asistís?" solo el formulario de RSVP real; el mini-formulario de
  // sugerir canción nunca manda status. Con eso distinguimos un RSVP
  // completo de alguien que solo pasó a dejar una canción.
  const isRealRsvp = status !== undefined;
  const trimmedName = name.trim();

  // Busca por nombre (sin importar mayúsculas/espacios) para no duplicar a la
  // misma persona si ya había hecho el RSVP o ya había sugerido una canción
  // antes -- se completa el mismo invitado en vez de crear uno nuevo.
  let guest = await Guest.findOne({
    eventId: event._id,
    name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' },
  });

  if (!guest) {
    guest = new Guest({ eventId: event._id, name: trimmedName, rsvpCompleted: isRealRsvp });
  }

  if (isRealRsvp) {
    guest.status = status;
    guest.dietaryRestrictions = dietaryRestrictions || '';
    guest.companionsCount = companionsCount || 0;
    if (Object.keys(cleanExtraAnswers).length > 0) guest.extraAnswers = cleanExtraAnswers;
    guest.rsvpCompleted = true;
  }

  if (songRequest !== undefined) {
    guest.songRequest = (songRequest || '').trim().slice(0, 150);
  }

  const wasNew = guest.isNew;
  await guest.save();
  res.status(wasNew ? 201 : 200).json(guest);
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
