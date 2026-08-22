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
    songRequest: { type: String, default: '', maxlength: 150 },
    // true por defecto a propósito: los invitados creados antes de este campo
    // vienen todos de un RSVP real. Solo se pone en false explícitamente al
    // crear un invitado nuevo a partir de una sugerencia de canción sin RSVP.
    rsvpCompleted: { type: Boolean, default: true },
    companionsCount: { type: Number, default: 0 },
    extraAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
