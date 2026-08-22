const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { containsBannedWord } = require('../utils/moderationFilter');

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 15.5; // pequeño margen sobre el límite de 15s del frontend

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Las imágenes y videos de un evento se separan en subcarpetas propias dentro
// de Cloudinary (eventos/{slug}/images vs eventos/{slug}/videos).
function getGalleryFolder(event, assetType) {
  const base = event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`;
  return `${base}/${assetType === 'video' ? 'videos' : 'images'}`;
}

function isTrustedCloudinaryUrl(url, folder, resourceType = 'image') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch {
    return false;
  }
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${escapeRegex(cloudName)}/${resourceType}/upload/.+/${escapeRegex(folder)}/[^/]+$`
  );
  return pattern.test(decodedUrl);
}

// Fallback para fotos viejas que no guardaron publicId: lo deduce de la URL.
function extractPublicIdFromUrl(url) {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function signUpload(req, res) {
  const { eventSlug } = req.params;
  const assetType = req.query.type === 'video' ? 'video' : 'image';

  const event = await Event.findOne({ eventSlug });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.liveGallery && !event.activeModules.photoCollection) {
    return res.status(403).json({ message: 'El módulo de galería no está activo para este evento' });
  }
  if (assetType === 'video' && !event.gallerySettings?.allowVideos) {
    return res.status(403).json({ message: 'La subida de videos no está habilitada para este evento' });
  }

  const folder = getGalleryFolder(event, assetType);
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
    resourceType: assetType,
  });
}

async function registerPhoto(req, res) {
  const {
    eventId,
    secure_url: secureUrl,
    public_id: publicId,
    comment,
    guestName,
    resourceType,
    duration,
    bytes,
  } = req.body;
  const assetType = resourceType === 'video' ? 'video' : 'image';

  if (!eventId || !secureUrl) {
    return res.status(400).json({ message: 'eventId y secure_url son requeridos' });
  }
  if (comment && comment.length > 150) {
    return res.status(400).json({ message: 'El comentario no puede superar los 150 caracteres' });
  }
  if (guestName && guestName.length > 40) {
    return res.status(400).json({ message: 'El nombre no puede superar los 40 caracteres' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  if (!event.activeModules.liveGallery && !event.activeModules.photoCollection) {
    return res.status(403).json({ message: 'El módulo de galería no está activo para este evento' });
  }

  if (assetType === 'video') {
    if (!event.gallerySettings?.allowVideos) {
      return res.status(403).json({ message: 'La subida de videos no está habilitada para este evento' });
    }
    if (typeof bytes === 'number' && bytes > MAX_VIDEO_BYTES) {
      return res.status(400).json({ message: 'El video supera el tamaño máximo permitido (20 MB)' });
    }
    if (typeof duration === 'number' && duration > MAX_VIDEO_SECONDS) {
      return res.status(400).json({ message: 'El video supera la duración máxima permitida (15 segundos)' });
    }
  }

  const folder = getGalleryFolder(event, assetType);
  if (!isTrustedCloudinaryUrl(secureUrl, folder, assetType)) {
    return res.status(400).json({ message: 'La URL del archivo no es válida' });
  }

  const cleanComment = (comment || '').trim().slice(0, 150);
  const cleanGuestName = (guestName || '').trim().slice(0, 40);
  const moderationMode = event.gallerySettings?.moderationMode || 'automatica';

  let status = 'aprobada';
  if (moderationMode === 'manual') {
    status = 'pendiente';
  } else if (moderationMode === 'semiautomatica' && (containsBannedWord(cleanComment) || containsBannedWord(cleanGuestName))) {
    status = 'pendiente';
  }

  const safePublicId = typeof publicId === 'string' && publicId.startsWith(folder) ? publicId : '';

  const photo = await Photo.create({
    eventId,
    cloudinaryUrl: secureUrl,
    publicId: safePublicId,
    assetType,
    comment: cleanComment,
    guestName: cleanGuestName,
    status,
  });

  if (event.activeModules.liveGallery) {
    const io = req.app.get('io');
    if (status === 'aprobada') {
      io.to(event.eventSlug).emit('new-photo', photo);
    } else if (status === 'pendiente') {
      io.to(event.eventSlug).emit('photo-pending', photo);
    }
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

  const maxLivePhotos = event.gallerySettings?.maxLivePhotos || 60;
  const photos = await Photo.find({ eventId: event._id, status: 'aprobada' })
    .sort({ createdAt: -1 })
    .limit(maxLivePhotos);
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

async function deletePhoto(req, res) {
  const { photoId } = req.params;

  const photo = await Photo.findOne({ _id: photoId, eventId: req.event._id });
  if (!photo) {
    return res.status(404).json({ message: 'Foto no encontrada' });
  }

  const publicId = photo.publicId || extractPublicIdFromUrl(photo.cloudinaryUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: photo.assetType === 'video' ? 'video' : 'image',
      });
    } catch (err) {
      console.error('[Cloudinary] No se pudo borrar el asset:', err.message);
    }
  }

  await photo.deleteOne();

  const io = req.app.get('io');
  io.to(req.event.eventSlug).emit('photo-deleted', { photoId });

  res.json({ message: 'Foto eliminada' });
}

// Cloudinary arma el ZIP al vuelo firmando una URL con todos los public_ids en
// la query string. Pasadas ~210-215 fotos esa URL se vuelve tan larga que
// Cloudinary la rechaza (414 Request-URI Too Large) -- se probó en vivo contra
// la cuenta real. Por eso se divide en partes de a lo sumo 150 para que un
// álbum grande nunca falle, solo se descargue en más de un archivo.
const MAX_PHOTOS_PER_ZIP = 150;

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function getAlbumZipUrl(req, res) {
  const assetType = req.query.type === 'video' ? 'video' : 'image';

  const photos = await Photo.find({ eventId: req.event._id, status: 'aprobada', assetType });

  const publicIds = photos
    .map((photo) => photo.publicId || extractPublicIdFromUrl(photo.cloudinaryUrl))
    .filter(Boolean);

  if (publicIds.length === 0) {
    return res.status(404).json({
      message: assetType === 'video' ? 'Todavía no hay videos aprobados para descargar' : 'Todavía no hay fotos aprobadas para descargar',
    });
  }

  const parts = chunk(publicIds, MAX_PHOTOS_PER_ZIP).map((ids) =>
    cloudinary.utils.download_zip_url({ public_ids: ids, resource_type: assetType })
  );

  res.json({ parts, count: publicIds.length });
}

module.exports = {
  signUpload,
  registerPhoto,
  getApprovedPhotosBySlug,
  getPhotosForClient,
  updatePhotoStatus,
  deletePhoto,
  getAlbumZipUrl,
};
