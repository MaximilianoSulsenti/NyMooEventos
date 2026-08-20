const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { containsBannedWord } = require('../utils/moderationFilter');

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
  const { eventId, secure_url: secureUrl, comment } = req.body;

  if (!eventId || !secureUrl) {
    return res.status(400).json({ message: 'eventId y secure_url son requeridos' });
  }
  if (comment && comment.length > 60) {
    return res.status(400).json({ message: 'El comentario no puede superar los 60 caracteres' });
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

  const cleanComment = (comment || '').trim().slice(0, 60);
  const moderationMode = event.gallerySettings?.moderationMode || 'automatica';

  let status = 'aprobada';
  if (moderationMode === 'manual') {
    status = 'pendiente';
  } else if (moderationMode === 'semiautomatica' && containsBannedWord(cleanComment)) {
    status = 'pendiente';
  }

  const photo = await Photo.create({
    eventId,
    cloudinaryUrl: secureUrl,
    comment: cleanComment,
    status,
  });

  const io = req.app.get('io');
  if (status === 'aprobada') {
    io.to(event.eventSlug).emit('new-photo', photo);
  } else if (status === 'pendiente') {
    io.to(event.eventSlug).emit('photo-pending', photo);
  }

  res.status(201).json(photo);
}

async function getApprovedPhotosBySlug(req, res) {
  const { eventSlug } = req.params;

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.liveGallery) {
    return res.status(403).json({ message: 'El módulo de galería no está activo para este evento' });
  }

  const photos = await Photo.find({ eventId: event._id, status: 'aprobada' }).sort({ createdAt: -1 });
  res.json(photos);
}

async function getPhotosForClient(req, res) {
  const photos = await Photo.find({ eventId: req.event._id }).sort({ createdAt: -1 });
  res.json(photos);
}

async function updatePhotoStatus(req, res) {
  const { photoId } = req.params;
  const { status } = req.body;

  if (!['pendiente', 'aprobada', 'rechazada'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const photo = await Photo.findOne({ _id: photoId, eventId: req.event._id });
  if (!photo) {
    return res.status(404).json({ message: 'Foto no encontrada' });
  }

  const wasApproved = photo.status === 'aprobada';
  photo.status = status;
  await photo.save();

  if (status === 'aprobada' && !wasApproved) {
    const io = req.app.get('io');
    io.to(req.event.eventSlug).emit('new-photo', photo);
  }

  res.json(photo);
}

module.exports = {
  signUpload,
  registerPhoto,
  getApprovedPhotosBySlug,
  getPhotosForClient,
  updatePhotoStatus,
};
