const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');

const DEFAULT_SECTIONS = [
  { id: 'Hero', enabled: true, order: 1, config: {} },
  { id: 'EventDetail', enabled: true, order: 2, config: {} },
  { id: 'Countdown', enabled: false, order: 3, config: {} },
  { id: 'Story', enabled: false, order: 4, config: {} },
  { id: 'Gallery', enabled: false, order: 5, config: {} },
  { id: 'LiveGallery', enabled: false, order: 6, config: {} },
  { id: 'Location', enabled: true, order: 7, config: {} },
  { id: 'RSVP', enabled: true, order: 8, config: {} },
  { id: 'SalonCarrousel', enabled: false, order: 9, config: {} },
  { id: 'Info', enabled: false, order: 10, config: {} },
  { id: 'MusicPlaylist', enabled: false, order: 11, config: {} },
  { id: 'Timeline', enabled: false, order: 12, config: {} },
  { id: 'Footer', enabled: true, order: 13, config: {} },
];

async function getEventBySlug(req, res) {
  const { eventSlug } = req.params;

  const event = await Event.findOne({ eventSlug }).select(
    'eventName eventSlug date activeModules appearance sections gallerySettings envelopeSettings'
  );

  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  res.json(event);
}

async function listMyEvents(req, res) {
  const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
  res.json(events);
}

async function createEvent(req, res) {
  const { eventName, eventSlug, date } = req.body;

  if (!eventName || !eventSlug || !date) {
    return res.status(400).json({ message: 'eventName, eventSlug y date son requeridos' });
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
  res.json(event);
}

async function updateEventModules(req, res) {
  const { eventId } = req.params;
  const { interactiveCard, liveGallery, guestControl } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  if (interactiveCard !== undefined) event.activeModules.interactiveCard = interactiveCard;
  if (liveGallery !== undefined) event.activeModules.liveGallery = liveGallery;
  if (guestControl !== undefined) event.activeModules.guestControl = guestControl;

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

module.exports = {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
  updateAppearance,
  updateEnvelopeSettings,
  updateSections,
  signAppearanceUpload,
  updateModerationModeForClient,
};
