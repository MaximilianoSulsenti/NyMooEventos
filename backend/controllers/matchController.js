const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const MatchProfile = require('../models/MatchProfile');
const MatchLike = require('../models/MatchLike');
const MatchPair = require('../models/MatchPair');
const { containsBannedWord } = require('../utils/moderationFilter');
const { isTrustedCloudinaryUrl, extractPublicIdFromUrl } = require('../utils/cloudinary');
const { normalizeWhatsapp } = require('../utils/whatsappLink');

// Tope blando anti-abuso, mismo criterio que MAX_PHOTOS_PER_EVENT en
// photoController.js -- ninguna boda real debería acercarse a esto.
const MAX_PROFILES_PER_EVENT = 400;

function getMatchFolder(event) {
  const base = event.gallerySettings?.cloudinaryFolder || `eventos/${event.eventSlug}`;
  return `${base}/wedding-match`;
}

async function isOverProfileCap(eventId) {
  const count = await MatchProfile.countDocuments({ eventId });
  return count >= MAX_PROFILES_PER_EVENT;
}

// --- Serializadores -- nunca se devuelve el documento de Mongoose tal cual,
// siempre a través de uno de estos, para que sea imposible que un campo
// sensible (whatsapp, deviceToken) se cuele en una respuesta nueva sin que
// alguien lo decida a propósito acá. ---

function toPublicProfile(p) {
  return {
    id: p._id,
    name: p.name,
    age: p.age,
    photoUrl: p.photoUrl,
    vibes: p.vibes,
    bio: p.bio,
    gender: p.gender,
    createdAt: p.createdAt,
  };
}

function toOwnProfile(p) {
  return {
    ...toPublicProfile(p),
    whatsapp: p.whatsapp || '',
    interestedIn: p.interestedIn,
    status: p.status,
  };
}

function toAdminProfile(p) {
  return {
    id: p._id,
    name: p.name,
    age: p.age,
    photoUrl: p.photoUrl,
    status: p.status,
    hasWhatsapp: Boolean(p.whatsapp),
    createdAt: p.createdAt,
  };
}

// --- Tiempo real -- rooms privados, nunca el room público del evento (ahí
// está también la pantalla del proyector). match-counters es la única
// excepción pública: son solo números, nada identificable. ---

function emitToEventRoom(req, eventSlug, eventName, payload) {
  req.app.get('io')?.to(eventSlug).emit(eventName, payload);
}

function emitToMatchRoom(req, eventSlug, eventName, payload) {
  req.app.get('io')?.to(`match:${eventSlug}`).emit(eventName, payload);
}

function emitToProfileRoom(req, profileId, eventName, payload) {
  req.app.get('io')?.to(`match-profile:${profileId}`).emit(eventName, payload);
}

async function emitCounters(req, event) {
  const [participants, matches] = await Promise.all([
    MatchProfile.countDocuments({ eventId: event._id, status: 'active' }),
    MatchPair.countDocuments({ eventId: event._id }),
  ]);
  emitToEventRoom(req, event.eventSlug, 'match-counters', { participants, matches });
  return { participants, matches };
}

// --- Invitado ---

async function getStats(req, res) {
  const [participants, matches] = await Promise.all([
    MatchProfile.countDocuments({ eventId: req.event._id, status: 'active' }),
    MatchPair.countDocuments({ eventId: req.event._id }),
  ]);
  res.json({ eventName: req.event.eventName, participants, matches });
}

async function getMe(req, res) {
  const token = req.header('x-match-token');
  if (!token) {
    return res.json({ profile: null });
  }
  const profile = await MatchProfile.findOne({ eventId: req.event._id, deviceToken: token }).select('+whatsapp');
  if (!profile) {
    return res.json({ profile: null });
  }
  if (profile.status === 'blocked') {
    return res.json({ profile: toOwnProfile(profile), blocked: true });
  }
  const matchesCount = await MatchPair.countDocuments({
    $or: [{ profileAId: profile._id }, { profileBId: profile._id }],
  });
  res.json({ profile: toOwnProfile(profile), blocked: false, matchesCount });
}

async function signMatchPhoto(req, res) {
  if (await isOverProfileCap(req.event._id)) {
    return res.status(403).json({ message: 'Este evento ya alcanzó el límite de perfiles de Wedding Match.' });
  }

  const folder = getMatchFolder(req.event);
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);

  res.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}

// Validación compartida entre crear y editar -- age queda afuera a
// propósito (es inmutable, solo se valida en createProfile).
function validateSecondaryFields(body) {
  const name = String(body.name || '').trim();
  if (name.length < 2 || name.length > 30) {
    return { error: 'El nombre tiene que tener entre 2 y 30 caracteres' };
  }
  if (containsBannedWord(name)) {
    return { error: 'Ese nombre no está permitido' };
  }

  const vibesInput = Array.isArray(body.vibes) ? body.vibes : [];
  const vibes = vibesInput.filter((v) => MatchProfile.VIBES.includes(v)).slice(0, 5);

  const bio = String(body.bio || '').trim().slice(0, 160);
  if (containsBannedWord(bio)) {
    return { error: 'Ese texto de presentación no está permitido' };
  }

  let whatsapp = '';
  if (body.whatsapp) {
    whatsapp = normalizeWhatsapp(body.whatsapp);
    if (!whatsapp) {
      return { error: 'El número de WhatsApp no es válido' };
    }
  }

  const gender = MatchProfile.GENDERS.includes(body.gender) ? body.gender : '';
  const interestedIn = MatchProfile.INTERESTED_IN.includes(body.interestedIn) ? body.interestedIn : 'todas';

  return { input: { name, vibes, bio, whatsapp, gender, interestedIn } };
}

async function createProfile(req, res) {
  const existingToken = req.header('x-match-token');
  if (existingToken) {
    const existing = await MatchProfile.findOne({ eventId: req.event._id, deviceToken: existingToken });
    if (existing) {
      return res.status(409).json({ message: 'Ya tenés un perfil creado en este evento', profile: toOwnProfile(existing) });
    }
  }

  if (await isOverProfileCap(req.event._id)) {
    return res.status(403).json({ message: 'Este evento ya alcanzó el límite de perfiles de Wedding Match.' });
  }

  const age = Number(req.body.age);
  if (!Number.isInteger(age) || age < 18 || age > 99) {
    return res.status(400).json({ message: 'Wedding Match es solo para mayores de 18 años' });
  }

  const { input, error } = validateSecondaryFields(req.body);
  if (error) return res.status(400).json({ message: error });

  const { photoUrl, photoPublicId } = req.body;
  const folder = getMatchFolder(req.event);
  if (!photoUrl || !isTrustedCloudinaryUrl(photoUrl, folder, 'image')) {
    return res.status(400).json({ message: 'La foto no es válida' });
  }
  const trustedPublicId = typeof photoPublicId === 'string' && photoPublicId.startsWith(folder) ? photoPublicId : '';

  const deviceToken = crypto.randomBytes(24).toString('hex');

  const profile = await MatchProfile.create({
    eventId: req.event._id,
    age,
    photoUrl,
    photoPublicId: trustedPublicId,
    deviceToken,
    ...input,
  });

  emitToMatchRoom(req, req.event.eventSlug, 'match-profile-joined', { profile: toPublicProfile(profile) });
  await emitCounters(req, req.event);

  res.status(201).json({ profile: toOwnProfile(profile), token: deviceToken });
}

async function updateProfile(req, res) {
  const { input, error } = validateSecondaryFields(req.body);
  if (error) return res.status(400).json({ message: error });

  const profile = req.matchProfile;
  const previousPublicId = profile.photoPublicId;
  const { photoUrl, photoPublicId } = req.body;

  Object.assign(profile, input);

  let photoChanged = false;
  if (photoUrl && photoUrl !== profile.photoUrl) {
    const folder = getMatchFolder(req.event);
    if (!isTrustedCloudinaryUrl(photoUrl, folder, 'image')) {
      return res.status(400).json({ message: 'La foto no es válida' });
    }
    profile.photoUrl = photoUrl;
    profile.photoPublicId = typeof photoPublicId === 'string' && photoPublicId.startsWith(folder) ? photoPublicId : '';
    photoChanged = true;
  }

  await profile.save();

  if (photoChanged && previousPublicId) {
    cloudinary.uploader.destroy(previousPublicId).catch((err) => {
      console.error('[Cloudinary] No se pudo borrar la foto anterior del perfil:', err.message);
    });
  }

  emitToMatchRoom(req, req.event.eventSlug, 'match-profile-updated', { profile: toPublicProfile(profile) });

  res.json({ profile: toOwnProfile(profile) });
}

async function deleteOwnProfile(req, res) {
  const profile = req.matchProfile;

  await Promise.all([
    MatchLike.deleteMany({ $or: [{ fromProfileId: profile._id }, { toProfileId: profile._id }] }),
    MatchPair.deleteMany({ $or: [{ profileAId: profile._id }, { profileBId: profile._id }] }),
    profile.deleteOne(),
  ]);

  if (profile.photoPublicId) {
    cloudinary.uploader.destroy(profile.photoPublicId).catch((err) => {
      console.error('[Cloudinary] No se pudo borrar la foto del perfil eliminado:', err.message);
    });
  }

  emitToMatchRoom(req, req.event.eventSlug, 'match-profile-removed', { profileId: profile._id });
  await emitCounters(req, req.event);

  res.status(204).send();
}

// Mapea mi preferencia (interestedIn) al/los género/s que debería ver, y
// viceversa -- 'todas' en cualquiera de los dos lados anula el filtro.
function genderMatchesPreference(gender, interestedIn) {
  if (interestedIn === 'todas') return true;
  if (interestedIn === 'mujeres') return gender === 'mujer';
  if (interestedIn === 'varones') return gender === 'varon';
  return true;
}

async function getFeed(req, res) {
  const me = req.matchProfile;

  const acted = await MatchLike.find({ fromProfileId: me._id }).select('toProfileId').lean();
  const excludeIds = [me._id, ...acted.map((a) => a.toProfileId)];

  const candidates = await MatchProfile.find({
    eventId: req.event._id,
    status: 'active',
    _id: { $nin: excludeIds },
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const deck = candidates
    .filter((c) => genderMatchesPreference(c.gender, me.interestedIn) && genderMatchesPreference(me.gender, c.interestedIn))
    .map(toPublicProfile);

  res.json({ deck, total: deck.length });
}

async function getGrid(req, res) {
  const me = req.matchProfile;

  const [profiles, myLikes, myPairs] = await Promise.all([
    MatchProfile.find({ eventId: req.event._id, status: 'active', _id: { $ne: me._id } })
      .sort({ createdAt: -1 })
      .lean(),
    MatchLike.find({ fromProfileId: me._id }).select('toProfileId action').lean(),
    MatchPair.find({ $or: [{ profileAId: me._id }, { profileBId: me._id }] }).lean(),
  ]);

  const actionById = new Map(myLikes.map((l) => [l.toProfileId.toString(), l.action]));
  const matchedIds = new Set(
    myPairs.map((p) => (p.profileAId.toString() === me._id.toString() ? p.profileBId.toString() : p.profileAId.toString()))
  );

  const grid = profiles.map((p) => ({
    ...toPublicProfile(p),
    myAction: actionById.get(p._id.toString()) || null,
    matched: matchedIds.has(p._id.toString()),
  }));

  res.json({ grid });
}

async function postAction(req, res) {
  const me = req.matchProfile;
  const { targetProfileId, action } = req.body;

  if (!['like', 'pass'].includes(action)) {
    return res.status(400).json({ message: 'Acción inválida' });
  }
  if (!targetProfileId || targetProfileId === String(me._id)) {
    return res.status(400).json({ message: 'Perfil inválido' });
  }

  const target = await MatchProfile.findOne({ _id: targetProfileId, eventId: req.event._id, status: 'active' }).select(
    '+whatsapp'
  );
  if (!target) {
    return res.status(404).json({ message: 'Ese perfil ya no está disponible' });
  }

  if (action === 'pass') {
    const existingPair = await MatchPair.exists({
      pairKey: [me._id, target._id].map(String).sort().join('_'),
    });
    if (existingPair) {
      return res.status(409).json({ message: 'Ya hicieron match, no se puede pasar de largo' });
    }
  }

  await MatchLike.findOneAndUpdate(
    { fromProfileId: me._id, toProfileId: target._id },
    { $set: { action }, $setOnInsert: { eventId: req.event._id } },
    { upsert: true }
  );

  if (action !== 'like') {
    return res.json({ matched: false });
  }

  const reciprocal = await MatchLike.findOne({ fromProfileId: target._id, toProfileId: me._id, action: 'like' })
    .select('_id')
    .lean();
  if (!reciprocal) {
    return res.json({ matched: false });
  }

  const [sortedA, sortedB] = [me._id, target._id].map(String).sort();
  const pairKey = `${sortedA}_${sortedB}`;
  let pair;
  let iCreatedIt = false;
  try {
    const r = await MatchPair.findOneAndUpdate(
      { pairKey },
      { $setOnInsert: { eventId: req.event._id, pairKey, profileAId: sortedA, profileBId: sortedB, matchedAt: new Date() } },
      { upsert: true, new: true, includeResultMetadata: true }
    );
    pair = r.value;
    iCreatedIt = Boolean(r.lastErrorObject?.upserted);
  } catch (err) {
    if (err.code !== 11000) throw err;
    pair = await MatchPair.findOne({ pairKey });
  }

  if (iCreatedIt) {
    emitToProfileRoom(req, me._id, 'match-made', {
      matchId: pair._id,
      matchedAt: pair.matchedAt,
      profile: { ...toPublicProfile(target), whatsapp: target.whatsapp || '' },
    });
    emitToProfileRoom(req, target._id, 'match-made', {
      matchId: pair._id,
      matchedAt: pair.matchedAt,
      profile: { ...toPublicProfile(me), whatsapp: me.whatsapp || '' },
    });
    await emitCounters(req, req.event);
  }

  res.json({
    matched: true,
    match: { matchId: pair._id, matchedAt: pair.matchedAt, profile: { ...toPublicProfile(target), whatsapp: target.whatsapp || '' } },
  });
}

async function getMyMatches(req, res) {
  const me = req.matchProfile;

  // Barrido de reconciliación -- cubre la ventana (sub-milisegundo, rarísima
  // pero posible) en la que dos likes casi simultáneos no se detectaron como
  // match mutuo en postAction. Esta vista se abre seguido, así que se
  // autocura sola en segundos si llegara a pasar.
  const [likedByMe, likedMe] = await Promise.all([
    MatchLike.find({ fromProfileId: me._id, action: 'like' }).select('toProfileId').lean(),
    MatchLike.find({ toProfileId: me._id, action: 'like' }).select('fromProfileId').lean(),
  ]);
  const likedByMeIds = new Set(likedByMe.map((l) => l.toProfileId.toString()));
  const reciprocalIds = likedMe.map((l) => l.fromProfileId.toString()).filter((id) => likedByMeIds.has(id));

  await Promise.all(
    reciprocalIds.map((otherId) => {
      const [sortedA, sortedB] = [me._id.toString(), otherId].sort();
      const pairKey = `${sortedA}_${sortedB}`;
      return MatchPair.findOneAndUpdate(
        { pairKey },
        { $setOnInsert: { eventId: req.event._id, pairKey, profileAId: sortedA, profileBId: sortedB, matchedAt: new Date() } },
        { upsert: true }
      ).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    })
  );

  const pairs = await MatchPair.find({ $or: [{ profileAId: me._id }, { profileBId: me._id }] })
    .sort({ matchedAt: -1 })
    .lean();

  const otherIds = pairs.map((p) => (p.profileAId.toString() === me._id.toString() ? p.profileBId : p.profileAId));
  const otherProfiles = await MatchProfile.find({ _id: { $in: otherIds } }).select('+whatsapp').lean();
  const profileById = new Map(otherProfiles.map((p) => [p._id.toString(), p]));

  const matches = pairs
    .map((pair) => {
      const otherId = (pair.profileAId.toString() === me._id.toString() ? pair.profileBId : pair.profileAId).toString();
      const other = profileById.get(otherId);
      // El otro lado puede haber sido bloqueado desde entonces -- se cae de
      // la lista (el doc de match queda, así que si se desbloquea reaparece).
      if (!other || other.status === 'blocked') return null;
      return {
        matchId: pair._id,
        matchedAt: pair.matchedAt,
        profile: { ...toPublicProfile(other), whatsapp: other.whatsapp || '' },
      };
    })
    .filter(Boolean);

  res.json({ matches });
}

// --- Organizador (dos vías: dueño logueado y link de token del cliente) ---

async function loadAdminPayload(event) {
  const [profiles, matches, likes] = await Promise.all([
    MatchProfile.find({ eventId: event._id }).sort({ createdAt: -1 }).lean(),
    MatchPair.countDocuments({ eventId: event._id }),
    MatchLike.countDocuments({ eventId: event._id, action: 'like' }),
  ]);
  const blocked = profiles.filter((p) => p.status === 'blocked').length;
  return {
    eventName: event.eventName,
    eventSlug: event.eventSlug,
    stats: { profiles: profiles.length, blocked, matches, likes },
    profiles: profiles.map(toAdminProfile),
  };
}

async function listProfilesForAdmin(req, res) {
  res.json(await loadAdminPayload(req.event));
}

async function listProfilesForClient(req, res) {
  if (!req.event.activeModules.weddingMatch) {
    return res.status(403).json({ message: 'Wedding Match no está activo para este evento' });
  }
  res.json(await loadAdminPayload(req.event));
}

async function setProfileStatus(req, res) {
  const { profileId } = req.params;
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const profile = await MatchProfile.findOne({ _id: profileId, eventId: req.event._id });
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  profile.status = status;
  await profile.save();

  if (status === 'blocked') {
    emitToMatchRoom(req, req.event.eventSlug, 'match-profile-blocked', { profileId: profile._id });
    emitToProfileRoom(req, profile._id, 'match-profile-status', { status: 'blocked' });
  } else {
    emitToMatchRoom(req, req.event.eventSlug, 'match-profile-unblocked', { profile: toPublicProfile(profile) });
    emitToProfileRoom(req, profile._id, 'match-profile-status', { status: 'active' });
  }
  await emitCounters(req, req.event);

  res.json({ profile: toAdminProfile(profile) });
}

async function updateProfileStatus(req, res) {
  await setProfileStatus(req, res);
}

async function updateProfileStatusForClient(req, res) {
  if (!req.event.activeModules.weddingMatch) {
    return res.status(403).json({ message: 'Wedding Match no está activo para este evento' });
  }
  await setProfileStatus(req, res);
}

async function removeProfileAsAdmin(req, res) {
  const { profileId } = req.params;
  const profile = await MatchProfile.findOne({ _id: profileId, eventId: req.event._id });
  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  await Promise.all([
    MatchLike.deleteMany({ $or: [{ fromProfileId: profile._id }, { toProfileId: profile._id }] }),
    MatchPair.deleteMany({ $or: [{ profileAId: profile._id }, { profileBId: profile._id }] }),
    profile.deleteOne(),
  ]);

  if (profile.photoPublicId || profile.photoUrl) {
    const publicId = profile.photoPublicId || extractPublicIdFromUrl(profile.photoUrl);
    if (publicId) {
      cloudinary.uploader.destroy(publicId).catch((err) => {
        console.error('[Cloudinary] No se pudo borrar la foto del perfil eliminado por el admin:', err.message);
      });
    }
  }

  emitToMatchRoom(req, req.event.eventSlug, 'match-profile-removed', { profileId: profile._id });
  await emitCounters(req, req.event);

  res.status(204).send();
}

async function deleteProfileAsAdmin(req, res) {
  await removeProfileAsAdmin(req, res);
}

async function deleteProfileForClient(req, res) {
  if (!req.event.activeModules.weddingMatch) {
    return res.status(403).json({ message: 'Wedding Match no está activo para este evento' });
  }
  await removeProfileAsAdmin(req, res);
}

module.exports = {
  getStats,
  getMe,
  signMatchPhoto,
  createProfile,
  updateProfile,
  deleteOwnProfile,
  getFeed,
  getGrid,
  postAction,
  getMyMatches,
  listProfilesForAdmin,
  listProfilesForClient,
  updateProfileStatus,
  updateProfileStatusForClient,
  deleteProfileAsAdmin,
  deleteProfileForClient,
};
