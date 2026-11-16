const mongoose = require('mongoose');

// Un match confirmado, aparte de los MatchLike que lo originaron -- hace
// falta un documento propio (en vez de derivarlo siempre al vuelo de los
// likes) para poder garantizar que se crea UNA SOLA VEZ aunque los dos
// "me gusta" lleguen casi en el mismo instante desde dos celulares
// distintos: pairKey es único, así que el índice de Mongo es la garantía
// real, no la lógica del controller (ver matchController.js, postAction).
const matchPairSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    // Siempre ordenados (A = el ObjectId menor como string) para que
    // pairKey sea estable sin importar quién haya completado el match.
    profileAId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchProfile', required: true },
    profileBId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchProfile', required: true },
    pairKey: { type: String, required: true, unique: true },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

matchPairSchema.index({ profileAId: 1 });
matchPairSchema.index({ profileBId: 1 });
matchPairSchema.index({ eventId: 1 });

module.exports = mongoose.model('MatchPair', matchPairSchema);
