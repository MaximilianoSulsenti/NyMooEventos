const mongoose = require('mongoose');

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
      isApprovedRequired: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
