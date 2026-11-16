const Event = require('../models/Event');
const MatchProfile = require('../models/MatchProfile');

// Carga el evento por slug y valida el módulo -- mismo criterio que
// updateTablesForClient/getTablesForClient en eventController.js: el botón
// del panel se oculta si el módulo está apagado, pero un link guardado
// podría saltearlo, así que el servidor lo valida también.
async function resolveMatchEvent(req, res, next) {
  const { eventSlug } = req.params;
  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules?.weddingMatch) {
    return res.status(403).json({ message: 'Wedding Match no está activo para este evento' });
  }
  req.event = event;
  next();
}

// Resuelve el perfil del invitado a partir del token opaco que guarda en su
// propio celular (header x-match-token, NO un JWT -- mismo nivel de
// seguridad que el passcode de invitaciones VIP: una clave de búsqueda, no
// una sesión autenticada). Siempre junto a eventId, así un token emitido en
// OTRA boda nunca resuelve acá.
async function requireMatchProfile(req, res, next) {
  const token = req.header('x-match-token');
  if (!token) {
    return res.status(401).json({ message: 'Falta crear tu perfil de Wedding Match' });
  }

  const profile = await MatchProfile.findOne({ eventId: req.event._id, deviceToken: token }).select(
    '+deviceToken +whatsapp'
  );
  if (!profile) {
    return res.status(401).json({ message: 'Tu perfil no existe más -- creá uno nuevo' });
  }
  if (profile.status === 'blocked') {
    return res.status(403).json({ code: 'PROFILE_BLOCKED', message: 'Tu perfil fue desactivado por el organizador' });
  }

  // Fire-and-forget: no bloquea la respuesta por esto, y que falle nunca
  // debe tumbar un request real.
  MatchProfile.updateOne({ _id: profile._id }, { $set: { lastSeenAt: new Date() } }).catch(() => {});

  req.matchProfile = profile;
  next();
}

module.exports = { resolveMatchEvent, requireMatchProfile };
