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
    // Plan premium (invitaciones personalizadas): cupo de acompañantes que
    // el organizador le asignó a esta familia/invitado, y el código que
    // identifica su link único. Vacío/null para invitados de los otros
    // planes -- no se usan y no rompen nada de lo existente.
    maxCompanionsAllowed: { type: Number, default: null },
    passcode: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
