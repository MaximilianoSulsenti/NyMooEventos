const Event = require('../models/Event');

async function requireClientToken(req, res, next) {
  const { eventSlug } = req.params;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'Falta el token de acceso' });
  }

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (event.clientAccessToken !== token) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  req.event = event;
  next();
}

module.exports = { requireClientToken };
