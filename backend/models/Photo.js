const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    cloudinaryUrl: { type: String, required: true },
    comment: { type: String, maxlength: 60, default: '' },
    status: {
      type: String,
      enum: ['pendiente', 'aprobada', 'rechazada'],
      default: 'aprobada',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Photo', photoSchema);
