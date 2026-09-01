const crypto = require('crypto');
const Event = require('../models/Event');
const Guest = require('../models/Guest');
const Photo = require('../models/Photo');
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
    'eventName eventSlug date activeModules appearance sections gallerySettings envelopeSettings brandingSettings uploadPageSettings musicSettings rsvpSettings isDuo duoLabel'
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
  const {
    interactiveCard,
    liveGallery,
    guestControl,
    photoCollection,
    messageBook,
    vipInvitations,
    tableOrganizer,
    playlistOrganizer,
    smartAgenda,
  } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  if (interactiveCard !== undefined) event.activeModules.interactiveCard = interactiveCard;
  if (liveGallery !== undefined) event.activeModules.liveGallery = liveGallery;
  if (guestControl !== undefined) event.activeModules.guestControl = guestControl;
  if (photoCollection !== undefined) event.activeModules.photoCollection = photoCollection;
  if (messageBook !== undefined) event.activeModules.messageBook = messageBook;
  if (vipInvitations !== undefined) event.activeModules.vipInvitations = vipInvitations;
  if (tableOrganizer !== undefined) event.activeModules.tableOrganizer = Boolean(tableOrganizer);
  if (playlistOrganizer !== undefined) event.activeModules.playlistOrganizer = Boolean(playlistOrganizer);
  if (smartAgenda !== undefined) event.activeModules.smartAgenda = Boolean(smartAgenda);

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
    titleFontFamily,
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
  if (titleFontFamily !== undefined) event.appearance.titleFontFamily = titleFontFamily;
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
  const {
    enabled,
    bgType,
    bgColor,
    bgUrl,
    bgOpacity,
    titleText,
    subtitleText,
    welcomeMessage,
    buttonText,
    fontFamily,
    fontSizeTitle,
    fontSizeSubtitle,
    textColor,
  } = req.body;

  if (enabled !== undefined) event.envelopeSettings.enabled = enabled;
  if (bgType !== undefined) event.envelopeSettings.bgType = bgType;
  if (bgColor !== undefined) event.envelopeSettings.bgColor = bgColor;
  if (bgUrl !== undefined) event.envelopeSettings.bgUrl = bgUrl;
  if (bgOpacity !== undefined) event.envelopeSettings.bgOpacity = bgOpacity;
  if (titleText !== undefined) event.envelopeSettings.titleText = titleText;
  if (subtitleText !== undefined) event.envelopeSettings.subtitleText = subtitleText;
  if (welcomeMessage !== undefined) event.envelopeSettings.welcomeMessage = welcomeMessage;
  if (buttonText !== undefined) event.envelopeSettings.buttonText = buttonText;
  if (fontFamily !== undefined) event.envelopeSettings.fontFamily = fontFamily;
  if (fontSizeTitle !== undefined) event.envelopeSettings.fontSizeTitle = fontSizeTitle;
  if (fontSizeSubtitle !== undefined) event.envelopeSettings.fontSizeSubtitle = fontSizeSubtitle;
  if (textColor !== undefined) event.envelopeSettings.textColor = textColor;

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

async function updateRsvpSettings(req, res) {
  const event = req.event;
  const {
    rsvpType,
    whatsappNumber,
    whatsappMessage,
    guestCardEnabled,
    guestCardAdultPrice,
    guestCardMinorPrice,
    guestCardDescription,
    duoInfoDescription,
  } = req.body;

  if (rsvpType !== undefined) {
    if (!Event.RSVP_TYPES.includes(rsvpType)) {
      return res.status(400).json({ message: 'Tipo de RSVP inválido' });
    }
    event.rsvpSettings.rsvpType = rsvpType;
  }
  if (whatsappNumber !== undefined) event.rsvpSettings.whatsappNumber = whatsappNumber;
  if (whatsappMessage !== undefined) event.rsvpSettings.whatsappMessage = whatsappMessage;
  if (guestCardEnabled !== undefined) event.rsvpSettings.guestCardEnabled = Boolean(guestCardEnabled);
  if (guestCardAdultPrice !== undefined) event.rsvpSettings.guestCardAdultPrice = String(guestCardAdultPrice).slice(0, 120);
  if (guestCardMinorPrice !== undefined) event.rsvpSettings.guestCardMinorPrice = String(guestCardMinorPrice).slice(0, 120);
  if (guestCardDescription !== undefined) event.rsvpSettings.guestCardDescription = String(guestCardDescription).slice(0, 500);
  if (duoInfoDescription !== undefined) event.rsvpSettings.duoInfoDescription = String(duoInfoDescription).slice(0, 800);

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

  const { salonBgImageUrl, salonBgOpacity } = req.body;
  if (salonBgImageUrl !== undefined) event.brandingSettings.salonBgImageUrl = salonBgImageUrl;
  if (salonBgOpacity !== undefined) event.brandingSettings.salonBgOpacity = salonBgOpacity;

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
  const { allowVideos, maxLivePhotos } = req.body;

  if (allowVideos !== undefined) event.gallerySettings.allowVideos = Boolean(allowVideos);
  if (maxLivePhotos !== undefined) {
    const parsed = Number(maxLivePhotos);
    if (!Number.isFinite(parsed) || parsed < 10 || parsed > 300) {
      return res.status(400).json({ message: 'El límite de fotos en vivo debe estar entre 10 y 300' });
    }
    event.gallerySettings.maxLivePhotos = parsed;
  }

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

// Organizador de mesas: valida y reemplaza tableOrganizerGuests[] + tables[]
// enteros de una (mismo patrón que updateSections). Queda en un helper
// porque este endpoint se llama tanto desde el panel del dueño del evento
// como desde el link exclusivo del cliente (requireClientToken) -- los dos
// wrappers de abajo solo difieren en de dónde sale `event`.
function buildTablesUpdate(body) {
  const { guests, tables } = body;

  if (!Array.isArray(guests) || !guests.every((g) => typeof g === 'string')) {
    return { error: 'guests debe ser un array de nombres' };
  }
  if (!Array.isArray(tables)) {
    return { error: 'tables debe ser un array' };
  }

  const cleanGuests = [...new Set(guests.map((g) => g.trim()).filter(Boolean))];
  const guestSet = new Set(cleanGuests);

  const seenNumbers = new Set();
  const cleanTables = [];

  for (const table of tables) {
    const tableNumber = Number(table?.tableNumber);
    const tableName = String(table?.tableName || '').trim();
    const maxSeats = Number(table?.maxSeats);
    const assignedGuests = Array.isArray(table?.assignedGuests)
      ? [...new Set(table.assignedGuests.map((g) => String(g).trim()).filter(Boolean))]
      : [];

    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      return { error: 'Cada mesa necesita un número válido' };
    }
    if (seenNumbers.has(tableNumber)) {
      return { error: `Hay más de una mesa con el número ${tableNumber}` };
    }
    seenNumbers.add(tableNumber);

    if (!tableName) {
      return { error: 'Cada mesa necesita un nombre' };
    }
    if (!Number.isInteger(maxSeats) || maxSeats < 1 || maxSeats > 100) {
      return { error: `La mesa "${tableName}" tiene una capacidad inválida` };
    }
    if (assignedGuests.length > maxSeats) {
      return {
        error: `La mesa "${tableName}" tiene más invitados asignados (${assignedGuests.length}) que asientos (${maxSeats})`,
      };
    }
    // Cualquier invitado asignado a una mesa tiene que existir en el pool --
    // evita que quede una mesa con un invitado "fantasma" que ya se sacó de
    // la lista general (ej. por un reimport de Excel que no lo incluía).
    const unknownGuest = assignedGuests.find((name) => !guestSet.has(name));
    if (unknownGuest) {
      return { error: `"${unknownGuest}" no está en la lista de invitados` };
    }

    cleanTables.push({ tableNumber, tableName: tableName.slice(0, 80), maxSeats, assignedGuests });
  }

  return { tableOrganizerGuests: cleanGuests, tables: cleanTables };
}

async function updateTables(req, res) {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const result = buildTablesUpdate(req.body);
  if (result.error) return res.status(400).json({ message: result.error });

  event.tableOrganizerGuests = result.tableOrganizerGuests;
  event.tables = result.tables;
  await event.save();

  res.json({ tableOrganizerGuests: event.tableOrganizerGuests, tables: event.tables });
}

// El link de cliente es la puerta de entrada comercial a este módulo (el
// botón del panel admin ya queda oculto si el módulo no está activo, pero
// alguien podría guardarse el link directo) -- acá sí se valida
// explícitamente activeModules.tableOrganizer, igual que el resto de los
// módulos pagos (galería, RSVP, etc.).
async function updateTablesForClient(req, res) {
  const event = req.event;
  if (!event.activeModules.tableOrganizer) {
    return res.status(403).json({ message: 'El organizador de mesas no está activo para este evento' });
  }

  const result = buildTablesUpdate(req.body);
  if (result.error) return res.status(400).json({ message: result.error });

  event.tableOrganizerGuests = result.tableOrganizerGuests;
  event.tables = result.tables;
  await event.save();

  res.json({ tableOrganizerGuests: event.tableOrganizerGuests, tables: event.tables });
}

// El resto de las páginas públicas (getEventBySlug) no exponen datos de
// invitados -- este endpoint sí, pero queda gateado por el token de cliente
// (mismo mecanismo que el panel de estadísticas), para que la lista de
// invitados/mesas nunca quede accesible desde el link público del evento.
async function getTablesForClient(req, res) {
  const event = req.event;
  if (!event.activeModules.tableOrganizer) {
    return res.status(403).json({ message: 'El organizador de mesas no está activo para este evento' });
  }
  res.json({
    eventName: event.eventName,
    tableOrganizerGuests: event.tableOrganizerGuests,
    tables: event.tables,
    // No es info sensible (ya se expone públicamente en getEventBySlug) --
    // se manda para que la pantalla pueda mostrar un botón cruzado hacia el
    // planificador de playlist cuando el cliente también compró esa
    // herramienta, sin tener que depender de que tenga activo el panel de
    // estadísticas (que no viene incluido en todos los planes).
    activeModules: event.activeModules,
  });
}

// Planificador de playlist: valida y reemplaza playlistSongBank[] +
// playlistTracks[] enteros de una (mismo patrón que buildTablesUpdate). Un
// tema es válido si tiene título; artista y notas son opcionales.
function sanitizeTrack(track) {
  const title = String(track?.title || '').trim();
  if (!title) return null;
  return {
    title: title.slice(0, 200),
    artist: String(track?.artist || '').trim().slice(0, 120),
    notes: String(track?.notes || '').trim().slice(0, 300),
  };
}

function buildPlaylistUpdate(body) {
  const { songBank, tracks } = body;

  if (!Array.isArray(songBank)) {
    return { error: 'songBank debe ser un array' };
  }
  if (!Array.isArray(tracks)) {
    return { error: 'tracks debe ser un array' };
  }

  const cleanSongBank = [];
  for (const raw of songBank) {
    const track = sanitizeTrack(raw);
    if (!track) {
      return { error: 'Cada canción del banco necesita un título' };
    }
    cleanSongBank.push(track);
  }

  // momentType es texto libre a propósito (el desplegable del front sugiere
  // momentos típicos pero el usuario puede agregar uno propio) -- solo se
  // valida que no esté vacío y que no haya dos bloques para el mismo momento.
  const seenMoments = new Set();
  const cleanMoments = [];

  for (const moment of tracks) {
    const momentType = String(moment?.momentType || '').trim();
    if (!momentType) {
      return { error: 'Cada bloque necesita un momento del evento' };
    }
    if (seenMoments.has(momentType)) {
      return { error: `Hay más de un bloque para "${momentType}"` };
    }
    seenMoments.add(momentType);

    const momentTracks = Array.isArray(moment?.tracks) ? moment.tracks : [];
    const cleanTracks = [];
    for (const raw of momentTracks) {
      const track = sanitizeTrack(raw);
      if (!track) {
        return { error: `Una canción del bloque "${momentType}" no tiene título` };
      }
      cleanTracks.push(track);
    }

    // Texto libre, sin validar que sea realmente un link de Spotify -- esa
    // validación (y la extracción del ID para el embed) vive en el
    // frontend; acá solo se sanitiza longitud, igual que el resto de los
    // campos de texto libre de este mismo endpoint.
    const spotifyUrl = String(moment?.spotifyUrl || '').trim().slice(0, 300);

    cleanMoments.push({ momentType: momentType.slice(0, 80), tracks: cleanTracks, spotifyUrl });
  }

  return { playlistSongBank: cleanSongBank, playlistTracks: cleanMoments };
}

async function updatePlaylist(req, res) {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const result = buildPlaylistUpdate(req.body);
  if (result.error) return res.status(400).json({ message: result.error });

  event.playlistSongBank = result.playlistSongBank;
  event.playlistTracks = result.playlistTracks;
  await event.save();

  res.json({ playlistSongBank: event.playlistSongBank, playlistTracks: event.playlistTracks });
}

// Mismo criterio que updateTablesForClient: el botón del panel admin ya
// queda oculto si el módulo no está activo, pero el link directo se valida
// igual acá por si alguien se lo guardó de antes.
async function updatePlaylistForClient(req, res) {
  const event = req.event;
  if (!event.activeModules.playlistOrganizer) {
    return res.status(403).json({ message: 'El planificador de playlist no está activo para este evento' });
  }

  const result = buildPlaylistUpdate(req.body);
  if (result.error) return res.status(400).json({ message: result.error });

  event.playlistSongBank = result.playlistSongBank;
  event.playlistTracks = result.playlistTracks;
  await event.save();

  res.json({ playlistSongBank: event.playlistSongBank, playlistTracks: event.playlistTracks });
}

async function getPlaylistForClient(req, res) {
  const event = req.event;
  if (!event.activeModules.playlistOrganizer) {
    return res.status(403).json({ message: 'El planificador de playlist no está activo para este evento' });
  }
  res.json({
    eventName: event.eventName,
    playlistSongBank: event.playlistSongBank,
    playlistTracks: event.playlistTracks,
    // Mismo criterio que getTablesForClient: permite mostrar un botón
    // cruzado hacia el organizador de mesas si el cliente también compró
    // esa herramienta, sin depender del panel de estadísticas.
    activeModules: event.activeModules,
  });
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
  if (partyLayout !== undefined && ['grid', 'single', 'carousel3d'].includes(partyLayout)) {
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

async function updateMaxLivePhotosForClient(req, res) {
  const maxLivePhotos = Number(req.body.maxLivePhotos);

  if (!Number.isFinite(maxLivePhotos) || maxLivePhotos < 10 || maxLivePhotos > 300) {
    return res.status(400).json({ message: 'El límite de fotos en vivo debe estar entre 10 y 300' });
  }

  const event = req.event;
  event.gallerySettings.maxLivePhotos = maxLivePhotos;
  await event.save();

  res.json(event);
}

// Invalida todos los links de cliente vigentes (panel de estadísticas,
// moderación de galería, organizador de mesas) generando un token nuevo --
// pensado como salida de emergencia si un link se compartió de más y se
// quiere cortar el acceso sin tener que borrar ni recrear el evento. Los
// links viejos con el token anterior dejan de funcionar al instante.
async function regenerateClientToken(req, res) {
  const event = req.event;
  event.clientAccessToken = crypto.randomBytes(16).toString('hex');
  await event.save();

  res.json({ clientAccessToken: event.clientAccessToken });
}

// Borra el evento por completo: invitados, fotos/videos (registro en Mongo
// Y los archivos reales en Cloudinary) y el evento en sí. El prefijo de
// Cloudinary lleva una barra al final a propósito -- sin eso, borrar
// "eventos/mi-boda" también coincidiría con "eventos/mi-boda-duo" (un clon
// Dúo de este mismo evento), porque delete_resources_by_prefix compara por
// texto, no por carpeta real.
async function deleteEvent(req, res) {
  const event = req.event;
  const folder = event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`;

  try {
    await cloudinary.api.delete_resources_by_prefix(`${folder}/`, { resource_type: 'image' });
    await cloudinary.api.delete_resources_by_prefix(`${folder}/`, { resource_type: 'video' });
  } catch (err) {
    console.error('[Cloudinary] No se pudieron borrar los archivos del evento:', err.message);
  }

  await Promise.all([Guest.deleteMany({ eventId: event._id }), Photo.deleteMany({ eventId: event._id })]);
  await event.deleteOne();

  res.json({ message: 'Evento eliminado' });
}

// Invitación Dúo: clona el evento completo (apariencia, fondos, tipografías,
// secciones, playlist, RSVP, etc.) bajo un slug y token de acceso propios,
// para que el organizador solo tenga que entrar al nuevo evento y ajustar lo
// puntual (horario, texto de la locación) sin rehacer el diseño de cero.
// Guests y Photos NO se copian -- viven en colecciones aparte referenciadas
// por eventId, así que el clon arranca sin invitados ni fotos del original.
async function duplicateDuo(req, res) {
  const original = req.event.toObject();

  const rawLabel = typeof req.body.label === 'string' ? req.body.label.trim() : '';
  const label = rawLabel.slice(0, 60) || 'Dúo';

  const baseSlug = `${original.eventSlug}-duo`;
  let eventSlug = baseSlug;
  let attempt = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Event.exists({ eventSlug })) {
    attempt += 1;
    eventSlug = `${baseSlug}-${attempt}`;
  }

  const {
    _id,
    createdAt,
    updatedAt,
    __v,
    clientAccessToken,
    eventSlug: _originalSlug,
    eventName,
    isDuo,
    duoOf,
    ...clonable
  } = original;

  const duoEvent = await Event.create({
    ...clonable,
    eventName: `${eventName} (${label})`,
    eventSlug,
    isDuo: true,
    duoOf: original._id,
    duoLabel: label,
  });

  res.status(201).json(duoEvent);
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
  updateRsvpSettings,
  updateSections,
  updateTables,
  updateTablesForClient,
  getTablesForClient,
  updatePlaylist,
  updatePlaylistForClient,
  getPlaylistForClient,
  signAppearanceUpload,
  updateModerationModeForClient,
  updatePlaybackSpeedForClient,
  updateMaxLivePhotosForClient,
  updateLiveControlsForClient,
  duplicateDuo,
  regenerateClientToken,
  deleteEvent,
};
