const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pendiente', 'confirmado', 'declinado'],
      default: 'pendiente',
    },
    dietaryRestrictions: { type: String, default: '' },
    companionsCount: { type: Number, default: 0 },
    extraAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
