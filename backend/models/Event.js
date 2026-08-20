const mongoose = require('mongoose');
const crypto = require('crypto');

const SECTION_TYPES = [
  'Hero',
  'Countdown',
  'EventDetail',
  'Story',
  'Gallery',
  'LiveGallery',
  'Location',
  'RSVP',
  'SalonCarrousel',
  'Info',
  'MusicPlaylist',
  'Timeline',
  'Footer',
];

const THEMES = ['minimalista', 'moderno', 'vanguardista', 'romantica'];
const MODERATION_MODES = ['manual', 'automatica', 'semiautomatica'];
const BG_TYPES = ['color', 'image', 'video'];

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
    },
    gallerySettings: {
      cloudinaryFolder: { type: String },
      moderationMode: { type: String, enum: MODERATION_MODES, default: 'automatica' },
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
      buttonText: { type: String, default: 'Abrir invitación' },
      fontFamily: { type: String, default: 'sans' },
    },
    sections: { type: [sectionSchema], default: [] },
    clientAccessToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
  },
  { timestamps: true }
);

eventSchema.statics.SECTION_TYPES = SECTION_TYPES;
eventSchema.statics.THEMES = THEMES;
eventSchema.statics.MODERATION_MODES = MODERATION_MODES;
eventSchema.statics.BG_TYPES = BG_TYPES;

module.exports = mongoose.model('Event', eventSchema);
