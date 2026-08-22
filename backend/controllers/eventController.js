const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const { isAdminEmail } = require('../middleware/admin');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // saca acentos (tras NFD)
    .replace(/[^a-z0-9]+/g, '-') // espacios y símbolos -> guion
    .replace(/^-+|-+$/g, '') // guiones al borde
    .slice(0, 80);
}

const DEFAULT_SECTIONS = [
  { id: 'Hero', enabled: true, order: 1, config: {} },
  { id: 'EventDetail', enabled: true, order: 2, config: {} },
  { id: 'Countdown', enabled: false, order: 3, config: {} },
  { id: 'Story', enabled: false, order: 4, config: {} },
  { id: 'Gallery', enabled: false, order: 5, config: {} },
  { id: 'LiveGallery', enabled: false, order: 6, config: {} },
  { id: 'DigitalAlbumButton', enabled: false, order: 7, config: {} },
  { id: 'Location', enabled: true, order: 8, config: {} },
  { id: 'RSVP', enabled: true, order: 9, config: {} },
  { id: 'GiftRegistry', enabled: false, order: 10, config: {} },
  { id: 'SalonCarrousel', enabled: false, order: 11, config: {} },
  { id: 'Info', enabled: false, order: 12, config: {} },
  { id: 'MusicPlaylist', enabled: false, order: 13, config: {} },
  { id: 'InstagramSection', enabled: false, order: 14, config: {} },
  { id: 'Timeline', enabled: false, order: 15, config: {} },
  { id: 'Footer', enabled: true, order: 16, config: {} },
];

// Agrega al array `sections` del evento cualquier tipo de sección nueva que se
// haya sumado al catálogo (Event.SECTION_TYPES) después de que el evento fue
// creado, para que los eventos viejos no se queden sin verla en el editor.
function reconcileSections(event) {
  const existingIds = new Set(event.sections.map((s) => s.id));
  const missing = Event.SECTION_TYPES.filter((id) => !existingIds.has(id));
  if (missing.length === 0) return false;

  const maxOrder = event.sections.reduce((max, s) => Math.max(max, s.order || 0), 0);
  missing.forEach((id, index) => {
    event.sections.push({ id, enabled: false, order: maxOrder + index + 1, config: {} });
  });
  return true;
}

async function getEventBySlug(req, res) {
  const { eventSlug } = req.params;

  const event = await Event.findOne({ eventSlug }).select(
    'eventName eventSlug date activeModules appearance sections gallerySettings envelopeSettings brandingSettings uploadPageSettings musicSettings'
  );

  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  reconcileSections(event);
  res.json(event);
}

async function listMyEvents(req, res) {
  // Los admins comparten un mismo espacio de trabajo: ven todos los
  // eventos, no solo los que ellos mismos crearon.
  const filter = isAdminEmail(req.user.email) ? {} : { organizerId: req.user._id };
  const events = await Event.find(filter).sort({ createdAt: -1 });
  res.json(events);
}

async function createEvent(req, res) {
  const { eventName, date } = req.body;
  const rawSlug = req.body.eventSlug;

  if (!eventName || !rawSlug || !date) {
    return res.status(400).json({ message: 'eventName, eventSlug y date son requeridos' });
  }

  const eventSlug = slugify(rawSlug);
  if (!eventSlug) {
    return res.status(400).json({ message: 'El slug ingresado no es válido' });
  }

  const existing = await Event.findOne({ eventSlug });
  if (existing) {
    return res.status(409).json({ message: 'Ya existe un evento con ese slug' });
  }

  const event = await Event.create({
    organizerId: req.user._id,
    eventName,
    eventSlug,
    date,
    gallerySettings: { cloudinaryFolder: `eventos/${eventSlug}` },
    sections: DEFAULT_SECTIONS,
  });

  res.status(201).json(event);
}

async function getEventById(req, res) {
  const event = req.event;
  const changed = reconcileSections(event);
  if (changed) {
    await event.save();
  }
  res.json(event);
}

async function updateEventModules(req, res) {
  const { eventId } = req.params;
  const { interactiveCard, liveGallery, guestControl, photoCollection } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  if (interactiveCard !== undefined) event.activeModules.interactiveCard = interactiveCard;
  if (liveGallery !== undefined) event.activeModules.liveGallery = liveGallery;
  if (guestControl !== undefined) event.activeModules.guestControl = guestControl;
  if (photoCollection !== undefined) event.activeModules.photoCollection = photoCollection;

  await event.save();

  res.json(event);
}

async function updateAppearance(req, res) {
  const event = req.event;
  const {
    theme,
    primaryColor,
    secondaryColor,
    backgroundColor,
    fontFamily,
    useGlobalBackground,
    globalBgType,
    globalBgUrl,
    globalBgOpacity,
    globalBgGradient,
  } = req.body;

  if (theme !== undefined) event.appearance.theme = theme;
  if (primaryColor !== undefined) event.appearance.primaryColor = primaryColor;
  if (secondaryColor !== undefined) event.appearance.secondaryColor = secondaryColor;
  if (backgroundColor !== undefined) event.appearance.backgroundColor = backgroundColor;
  if (fontFamily !== undefined) event.appearance.fontFamily = fontFamily;
  if (useGlobalBackground !== undefined) event.appearance.useGlobalBackground = useGlobalBackground;
  if (globalBgType !== undefined) event.appearance.globalBgType = globalBgType;
  if (globalBgUrl !== undefined) event.appearance.globalBgUrl = globalBgUrl;
  if (globalBgOpacity !== undefined) event.appearance.globalBgOpacity = globalBgOpacity;
  if (globalBgGradient !== undefined) event.appearance.globalBgGradient = globalBgGradient;

  await event.save();
  res.json(event);
}

async function updateEnvelopeSettings(req, res) {
  const event = req.event;
  const { enabled, bgType, bgColor, bgUrl, bgOpacity, titleText, buttonText, fontFamily } = req.body;

  if (enabled !== undefined) event.envelopeSettings.enabled = enabled;
  if (bgType !== undefined) event.envelopeSettings.bgType = bgType;
  if (bgColor !== undefined) event.envelopeSettings.bgColor = bgColor;
  if (bgUrl !== undefined) event.envelopeSettings.bgUrl = bgUrl;
  if (bgOpacity !== undefined) event.envelopeSettings.bgOpacity = bgOpacity;
  if (titleText !== undefined) event.envelopeSettings.titleText = titleText;
  if (buttonText !== undefined) event.envelopeSettings.buttonText = buttonText;
  if (fontFamily !== undefined) event.envelopeSettings.fontFamily = fontFamily;

  await event.save();
  res.json(event);
}

async function updateMusicSettings(req, res) {
  const event = req.event;
  const { enabled, audioUrl, title, position, volume } = req.body;

  if (enabled !== undefined) event.musicSettings.enabled = Boolean(enabled);
  if (audioUrl !== undefined) event.musicSettings.audioUrl = audioUrl;
  if (title !== undefined) event.musicSettings.title = title;
  if (position !== undefined) event.musicSettings.position = position;
  if (volume !== undefined) event.musicSettings.volume = volume;

  await event.save();
  res.json(event);
}

function applyBrandFields(brand, body) {
  const { enabled, logoUrl, position, size, opacity } = body;
  if (enabled !== undefined) brand.enabled = enabled;
  if (logoUrl !== undefined) brand.logoUrl = logoUrl;
  if (position !== undefined) brand.position = position;
  if (size !== undefined) brand.size = size;
  if (opacity !== undefined) brand.opacity = opacity;
}

async function updateMyBranding(req, res) {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  applyBrandFields(event.brandingSettings.myBrand, req.body);
  await event.save();
  res.json(event);
}

async function updateClientBranding(req, res) {
  const event = req.event;
  applyBrandFields(event.brandingSettings.clientBrand, req.body);
  await event.save();
  res.json(event);
}

async function updateUploadPageSettings(req, res) {
  const event = req.event;
  const { theme, bgType, bgColor, bgImageUrl, bgOpacity } = req.body;

  if (theme !== undefined) event.uploadPageSettings.theme = theme;
  if (bgType !== undefined) event.uploadPageSettings.bgType = bgType;
  if (bgColor !== undefined) event.uploadPageSettings.bgColor = bgColor;
  if (bgImageUrl !== undefined) event.uploadPageSettings.bgImageUrl = bgImageUrl;
  if (bgOpacity !== undefined) event.uploadPageSettings.bgOpacity = bgOpacity;

  await event.save();
  res.json(event);
}

async function updateGallerySettings(req, res) {
  const event = req.event;
  const { allowVideos } = req.body;

  if (allowVideos !== undefined) event.gallerySettings.allowVideos = Boolean(allowVideos);

  await event.save();
  res.json(event);
}

async function updateSections(req, res) {
  const event = req.event;
  const { sections } = req.body;

  if (!Array.isArray(sections)) {
    return res.status(400).json({ message: 'sections debe ser un array' });
  }

  const validIds = Event.SECTION_TYPES;
  const isValid = sections.every(
    (section) => section && validIds.includes(section.id) && typeof section.order === 'number'
  );
  if (!isValid) {
    return res.status(400).json({ message: 'Alguna sección tiene un id u order inválido' });
  }

  event.sections = sections.map((section) => ({
    id: section.id,
    enabled: Boolean(section.enabled),
    order: section.order,
    config: section.config || {},
  }));

  await event.save();
  res.json(event);
}

async function signAppearanceUpload(req, res) {
  const event = req.event;
  const folder = `${event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`}/appearance`;
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
  });
}

async function updateModerationModeForClient(req, res) {
  const { moderationMode } = req.body;

  if (!Event.MODERATION_MODES.includes(moderationMode)) {
    return res.status(400).json({ message: 'Modo de moderación inválido' });
  }

  const event = req.event;
  event.gallerySettings.moderationMode = moderationMode;
  await event.save();

  res.json(event);
}

async function updateLiveControlsForClient(req, res) {
  const { partyMode, partyLayout, confetti, lightBeams, emojiRain, isPaused } = req.body;
  const event = req.event;

  if (partyMode !== undefined) event.gallerySettings.partyMode = Boolean(partyMode);
  if (partyLayout !== undefined && ['grid', 'single'].includes(partyLayout)) {
    event.gallerySettings.partyLayout = partyLayout;
  }
  if (confetti !== undefined) event.gallerySettings.confetti = Boolean(confetti);
  if (lightBeams !== undefined) event.gallerySettings.lightBeams = Boolean(lightBeams);
  if (emojiRain !== undefined) event.gallerySettings.emojiRain = Boolean(emojiRain);
  if (isPaused !== undefined) event.gallerySettings.isPaused = Boolean(isPaused);

  await event.save();
  res.json(event);
}

async function updatePlaybackSpeedForClient(req, res) {
  const seconds = Number(req.body.seconds);

  if (!Number.isFinite(seconds) || seconds < 2 || seconds > 15) {
    return res.status(400).json({ message: 'La velocidad debe estar entre 2 y 15 segundos' });
  }

  const event = req.event;
  event.gallerySettings.playbackSpeed = seconds;
  await event.save();

  res.json(event);
}

module.exports = {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
  updateAppearance,
  updateEnvelopeSettings,
  updateMyBranding,
  updateClientBranding,
  updateUploadPageSettings,
  updateGallerySettings,
  updateMusicSettings,
  updateSections,
  signAppearanceUpload,
  updateModerationModeForClient,
  updatePlaybackSpeedForClient,
  updateLiveControlsForClient,
};
