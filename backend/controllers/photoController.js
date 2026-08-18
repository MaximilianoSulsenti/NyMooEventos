const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const Photo = require('../models/Photo');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isTrustedCloudinaryUrl(url, folder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${escapeRegex(cloudName)}/image/upload/.+/${escapeRegex(folder)}/[^/]+$`
  );
  return pattern.test(url);
}

async function signUpload(req, res) {
  const { eventSlug } = req.params;

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.liveGallery) {
    return res.status(403).json({ message: 'El módulo de galería no está activo para este evento' });
  }

  const folder = event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    eventId: event._id,
  });
}

async function registerPhoto(req, res) {
  const { eventId, secure_url: secureUrl } = req.body;

  if (!eventId || !secureUrl) {
    return res.status(400).json({ message: 'eventId y secure_url son requeridos' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.liveGallery) {
    return res.status(403).json({ message: 'El módulo de galería no está activo para este evento' });
  }

  const folder = event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`;
  if (!isTrustedCloudinaryUrl(secureUrl, folder)) {
    return res.status(400).json({ message: 'La URL de la imagen no es válida' });
  }

  const photo = await Photo.create({ eventId, cloudinaryUrl: secureUrl });

  const io = req.app.get('io');
  io.to(event.eventSlug).emit('new-photo', photo);

  res.status(201).json(photo);
}

module.exports = { signUpload, registerPhoto };
