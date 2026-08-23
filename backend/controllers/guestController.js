const crypto = require('crypto');
const Event = require('../models/Event');
const Guest = require('../models/Guest');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function slugifyName(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// Genera un código de invitación único dentro del evento (ej. "familia-perez-4f2a"),
// legible para poder compartirlo a mano si hiciera falta. Reintenta con otro
// sufijo random en el caso, muy poco probable, de que ya exista.
async function generateUniquePasscode(eventId, name) {
  const base = slugifyName(name) || 'invitado';
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = crypto.randomBytes(3).toString('hex');
    const candidate = `${base}-${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Guest.exists({ eventId, passcode: candidate });
    if (!exists) return candidate;
  }
  throw new Error('No se pudo generar un código único');
}

async function submitRsvp(req, res) {
  const { eventSlug, guestId, name, status, dietaryRestrictions, songRequest, companionsCount, extraAnswers } = req.body;

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

  let guest = null;

  // Plan premium: el invitado ya existe (lo cargó el organizador de
  // antemano con su cupo de acompañantes), así que se actualiza ESE
  // registro puntual en vez de buscar/crear por nombre.
  if (guestId) {
    guest = await Guest.findOne({ _id: guestId, eventId: event._id });
    if (!guest) {
      return res.status(404).json({ message: 'No encontramos tu invitación' });
    }
  } else {
    // Busca por nombre (sin importar mayúsculas/espacios) para no duplicar a
    // la misma persona si ya había hecho el RSVP o ya había sugerido una
    // canción antes -- se completa el mismo invitado en vez de crear uno nuevo.
    guest = await Guest.findOne({
      eventId: event._id,
      name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' },
    });
    if (!guest) {
      guest = new Guest({ eventId: event._id, name: trimmedName, rsvpCompleted: isRealRsvp });
    }
  }

  if (isRealRsvp) {
    const maxAllowed = guest.maxCompanionsAllowed;
    const requestedCompanions = companionsCount || 0;
    if (maxAllowed != null && requestedCompanions > maxAllowed) {
      return res.status(400).json({ message: `Tu cupo permite hasta ${maxAllowed} acompañante(s)` });
    }

    guest.status = status;
    guest.dietaryRestrictions = dietaryRestrictions || '';
    guest.companionsCount = requestedCompanions;
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

// --- Plan premium: invitados pre-cargados con cupo propio ---

async function createPremiumGuest(req, res) {
  const { eventId } = req.params;
  const { name, maxCompanionsAllowed } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  const parsedMax = Number(maxCompanionsAllowed);
  if (!Number.isFinite(parsedMax) || parsedMax < 0 || parsedMax > 50) {
    return res.status(400).json({ message: 'El cupo de acompañantes debe ser un número entre 0 y 50' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const trimmedName = name.trim();
  const passcode = await generateUniquePasscode(event._id, trimmedName);

  const guest = await Guest.create({
    eventId: event._id,
    name: trimmedName,
    maxCompanionsAllowed: parsedMax,
    passcode,
  });

  res.status(201).json(guest);
}

async function deleteGuest(req, res) {
  const { guestId } = req.params;

  const guest = await Guest.findByIdAndDelete(guestId);
  if (!guest) {
    return res.status(404).json({ message: 'Invitado no encontrado' });
  }

  res.json({ message: 'Invitado eliminado' });
}

// Acceso público (sin login) para que el invitado que entra con su link
// personalizado (?guest=<passcode>) vea sus propios datos. Solo expone lo
// mínimo necesario para prellenar el formulario, no el resto de la lista.
async function lookupGuestByPasscode(req, res) {
  const { eventSlug, passcode } = req.params;

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const guest = await Guest.findOne({ eventId: event._id, passcode });
  if (!guest) {
    return res.status(404).json({ message: 'No encontramos tu invitación' });
  }

  res.json({
    _id: guest._id,
    name: guest.name,
    maxCompanionsAllowed: guest.maxCompanionsAllowed,
    status: guest.status,
    companionsCount: guest.companionsCount,
  });
}

// Acceso público para el plan premium cuando el invitado entra al link
// genérico sin token: busca su nombre en la lista pre-cargada por el
// organizador. Coincidencia exacta (sin mayúsculas/espacios) a propósito --
// es lo que hace que la invitación sea "solo para invitados", no un
// buscador abierto de todos los nombres.
async function searchGuestByName(req, res) {
  const { eventSlug } = req.params;
  const name = (req.query.name || '').trim();

  if (!name) {
    return res.status(400).json({ message: 'Ingresá tu nombre' });
  }

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const guest = await Guest.findOne({
    eventId: event._id,
    passcode: { $ne: '' },
    name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
  });

  if (!guest) {
    return res.status(404).json({ message: 'No encontramos tu nombre en la lista de invitados' });
  }

  res.json({
    _id: guest._id,
    name: guest.name,
    maxCompanionsAllowed: guest.maxCompanionsAllowed,
    status: guest.status,
    companionsCount: guest.companionsCount,
  });
}

module.exports = {
  submitRsvp,
  getGuestsByEvent,
  getGuestsForClient,
  createPremiumGuest,
  deleteGuest,
  lookupGuestByPasscode,
  searchGuestByName,
};
