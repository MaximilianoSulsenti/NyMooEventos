const mongoose = require('mongoose');

// Whitelist en vez de texto libre -- es el campo más visible de la tarjeta
// (se muestra tal cual a cualquier otro invitado soltero), así que no
// necesita cola de moderación como bio/name: solo puede contener uno de
// estos valores exactos.
const VIBES = [
  'Bailar',
  'Fernet',
  'Asado',
  'Viajar',
  'Gym',
  'Series',
  'Mate',
  'Fútbol',
  'Música en vivo',
  'Perros',
  'Gatos',
  'Tragos',
  'Cumbia',
  'Rock',
  'Playa',
];

const GENDERS = ['mujer', 'varon', 'otro', ''];
const INTERESTED_IN = ['mujeres', 'varones', 'todas'];

// Colección propia (no un array embebido en Event) -- Wedding Match tiene
// potencialmente decenas de celulares escribiendo su propio registro al
// mismo tiempo durante la fiesta, igual que Guest.js/Photo.js: cada uno se
// crea, edita y borra de forma independiente, nunca se reemplaza "la lista
// entera" de una. Un array embebido ahí sí tendría carreras reales de
// lectura-escritura entre invitados distintos.
const matchProfileSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 30 },
    // Entero 18-99 validado también en el controller (ahí es donde sale el
    // mensaje en español) -- esto queda como la garantía real a nivel de
    // datos para cualquier otro camino de escritura futuro (script, etc.).
    age: { type: Number, required: true, min: 18, max: 99 },
    photoUrl: { type: String, required: true },
    // Para poder borrar el archivo real de Cloudinary al reemplazar la foto
    // o eliminar el perfil (ver utils/cloudinary.js extractPublicIdFromUrl
    // como fallback si faltara en perfiles viejos).
    photoPublicId: { type: String, default: '' },
    vibes: { type: [String], default: [] },
    bio: { type: String, default: '', trim: true, maxlength: 160 },
    // select:false a propósito en los dos campos de abajo -- que sean
    // "opt-in" por query (hay que pedirlos explícitamente con +whatsapp /
    // +deviceToken) en vez de "opt-out", para que un find() nuevo que
    // alguien agregue más adelante no termine filtrando el teléfono de un
    // invitado o el token de sesión de otro sin querer.
    whatsapp: { type: String, default: '', select: false },
    deviceToken: { type: String, required: true, unique: true, select: false },
    gender: { type: String, enum: GENDERS, default: '' },
    interestedIn: { type: String, enum: INTERESTED_IN, default: 'todas' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Resolución del token al abrir la app (GET /me, todo request autenticado
// por header) -- siempre junto a eventId, así un token emitido en OTRA
// boda nunca resuelve acá.
matchProfileSchema.index({ eventId: 1, status: 1, createdAt: -1 });

matchProfileSchema.statics.VIBES = VIBES;
matchProfileSchema.statics.GENDERS = GENDERS;
matchProfileSchema.statics.INTERESTED_IN = INTERESTED_IN;

module.exports = mongoose.model('MatchProfile', matchProfileSchema);
