const mongoose = require('mongoose');

// Una acción dirigida (A sobre B) por documento, no un array dentro de
// MatchProfile -- el índice único de abajo hace que un doble-tap sea un
// no-op real a nivel de base de datos (upsert) en vez de depender de que
// el frontend nunca mande la misma acción dos veces, y resolver "¿el otro
// ya me likeó?" es un findOne indexado en vez de tener que cargar el
// documento entero de la otra persona.
const matchLikeSchema = new mongoose.Schema(
  {
    // Denormalizado a propósito (se puede derivar de fromProfileId) -- hace
    // que el cascade delete del evento y las estadísticas del admin sean un
    // solo índice directo, sin tener que resolver perfiles primero.
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    fromProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchProfile', required: true },
    toProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchProfile', required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
  },
  { timestamps: true }
);

// Único por par ordenado (from, to) -- es la pieza que hace idempotente la
// acción de swipe (upsert en vez de insert) y la que hace posible el
// "pass -> like" sin duplicar documentos.
matchLikeSchema.index({ fromProfileId: 1, toProfileId: 1 }, { unique: true });
// Reciprocidad ("¿alguien que yo likeé también me likeó a mí?") y el barrido
// de reconciliación de matches -- ambos filtran por toProfileId + action.
matchLikeSchema.index({ toProfileId: 1, action: 1 });
matchLikeSchema.index({ eventId: 1 });

module.exports = mongoose.model('MatchLike', matchLikeSchema);
