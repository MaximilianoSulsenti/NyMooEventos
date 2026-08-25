const mongoose = require('mongoose');
const crypto = require('crypto');

const SECTION_TYPES = [
  'Hero',
  'Countdown',
  'EventDetail',
  'Story',
  'Gallery',
  'LiveGallery',
  'DigitalAlbumButton',
  'Location',
  'RSVP',
  'GiftRegistry',
  'SalonCarrousel',
  'Info',
  'MusicPlaylist',
  'InstagramSection',
  'Timeline',
  'Footer',
];

const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica', 'bohemio', 'elegante', 'festivo'];
const MODERATION_MODES = ['manual', 'automatica', 'semiautomatica'];
const BG_TYPES = ['color', 'image', 'video'];
const RSVP_TYPES = ['basico_whatsapp', 'intermedio_db', 'premium_personalizado'];
const BRAND_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const brandSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    logoUrl: { type: String, default: '' },
    position: { type: String, enum: BRAND_POSITIONS, default: 'bottom-right' },
    size: { type: Number, default: 64, min: 24, max: 200 },
    opacity: { type: Number, default: 60, min: 10, max: 100 },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, enum: SECTION_TYPES, required: true },
    enabled: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventName: { type: String, required: true, trim: true },
    eventSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    date: { type: Date, required: true },
    activeModules: {
      interactiveCard: { type: Boolean, default: false },
      guestControl: { type: Boolean, default: false },
      liveGallery: { type: Boolean, default: false },
      photoCollection: { type: Boolean, default: false },
      messageBook: { type: Boolean, default: false },
      vipInvitations: { type: Boolean, default: false },
    },
    gallerySettings: {
      cloudinaryFolder: { type: String },
      moderationMode: { type: String, enum: MODERATION_MODES, default: 'automatica' },
      playbackSpeed: { type: Number, default: 7, min: 2, max: 15 },
      maxLivePhotos: { type: Number, default: 60, min: 10, max: 300 },
      allowVideos: { type: Boolean, default: false },
      partyMode: { type: Boolean, default: false },
      partyLayout: { type: String, enum: ['grid', 'single', 'carousel3d'], default: 'grid' },
      confetti: { type: Boolean, default: false },
      lightBeams: { type: Boolean, default: false },
      emojiRain: { type: Boolean, default: false },
      isPaused: { type: Boolean, default: false },
    },
    appearance: {
      theme: { type: String, enum: THEMES, default: 'minimalista' },
      primaryColor: { type: String, default: '#a855f7' },
      secondaryColor: { type: String, default: '#111827' },
      backgroundColor: { type: String, default: '#0a0a0a' },
      fontFamily: { type: String, default: 'sans' },
      useGlobalBackground: { type: Boolean, default: false },
      globalBgType: { type: String, enum: BG_TYPES, default: 'color' },
      globalBgUrl: { type: String, default: '' },
      globalBgOpacity: { type: Number, default: 100, min: 0, max: 100 },
      globalBgGradient: { type: String, default: '' },
    },
    envelopeSettings: {
      enabled: { type: Boolean, default: false },
      bgType: { type: String, enum: BG_TYPES, default: 'color' },
      bgColor: { type: String, default: '#0a0a0a' },
      bgUrl: { type: String, default: '' },
      bgOpacity: { type: Number, default: 100, min: 0, max: 100 },
      titleText: { type: String, default: '' },
      subtitleText: { type: String, default: '' },
      buttonText: { type: String, default: 'Abrir invitación' },
      fontFamily: { type: String, default: 'sans' },
      fontSizeTitle: { type: String, default: 'text-base' },
      fontSizeSubtitle: { type: String, default: 'text-sm' },
      textColor: { type: String, default: '' },
    },
    brandingSettings: {
      myBrand: { type: brandSchema, default: () => ({}) },
      clientBrand: { type: brandSchema, default: () => ({}) },
      // Fondo de marca de otros organizadores para la pantalla del salón
      // (LiveScreen) -- distinto de myBrand/clientBrand, que son watermarks
      // chicos: esto es una imagen a pantalla completa detrás de las fotos.
      salonBgImageUrl: { type: String, default: '' },
      salonBgOpacity: { type: Number, default: 40, min: 0, max: 100 },
    },
    rsvpSettings: {
      // intermedio_db es el default para no cambiarle el comportamiento a
      // ningún evento ya creado antes de este campo.
      rsvpType: { type: String, enum: RSVP_TYPES, default: 'intermedio_db' },
      whatsappNumber: { type: String, default: '' },
      whatsappMessage: { type: String, default: '' },
      // "Ver valor de la tarjeta": botón opcional dentro del RSVP para que
      // el invitado vea cuánto cuesta su lugar (cuando la tarjeta del
      // salón tiene costo) sin tener que preguntarle directo a los
      // anfitriones. Precios en texto libre a propósito, igual que
      // guestCardDetails.pricePerCard en Order.js -- no siempre hay un
      // número cerrado (puede ser "a confirmar", "USD 20", etc.).
      guestCardEnabled: { type: Boolean, default: false },
      guestCardAdultPrice: { type: String, default: '' },
      guestCardMinorPrice: { type: String, default: '' },
      guestCardDescription: { type: String, default: '' },
    },
    musicSettings: {
      enabled: { type: Boolean, default: false },
      audioUrl: { type: String, default: '' },
      title: { type: String, default: '' },
      position: { type: String, enum: BRAND_POSITIONS, default: 'bottom-right' },
      volume: { type: Number, default: 70, min: 0, max: 100 },
    },
    uploadPageSettings: {
      theme: { type: String, enum: THEMES, default: 'minimalista' },
      bgType: { type: String, enum: BG_TYPES, default: 'color' },
      bgColor: { type: String, default: '#0a0a0a' },
      bgImageUrl: { type: String, default: '' },
      bgOpacity: { type: Number, default: 100, min: 0, max: 100 },
    },
    sections: { type: [sectionSchema], default: [] },
    clientAccessToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    // Invitación Dúo: clon de otro evento con su propio slug/token, para
    // organizar por separado a dos grupos del mismo festejo (cena vs.
    // post-cena, con/sin tarjeta del salón, etc.) sin rehacer todo el diseño.
    isDuo: { type: Boolean, default: false },
    duoOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    // Qué representa esta versión Dúo (ej. "Brindis", "Fiesta", o texto
    // libre que haya escrito el organizador) -- se usa para el nombre del
    // evento clonado y, cuando el original tiene invitaciones VIP, para la
    // card final que reemplaza al formulario de RSVP (ver RSVPSection.jsx).
    duoLabel: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.statics.SECTION_TYPES = SECTION_TYPES;
eventSchema.statics.THEMES = THEMES;
eventSchema.statics.MODERATION_MODES = MODERATION_MODES;
eventSchema.statics.BG_TYPES = BG_TYPES;
eventSchema.statics.BRAND_POSITIONS = BRAND_POSITIONS;
eventSchema.statics.RSVP_TYPES = RSVP_TYPES;

module.exports = mongoose.model('Event', eventSchema);
