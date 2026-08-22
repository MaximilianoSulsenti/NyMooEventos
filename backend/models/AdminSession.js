const mongoose = require('mongoose');

// Documento único (key: 'lock') que registra qué admin tiene la sesión
// activa en este momento. La plataforma es privada y comparten el mismo
// espacio de trabajo (los mismos eventos), así que solo puede haber una
// persona conectada a la vez para no pisarse al editar algo.
const adminSessionSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'lock', unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSession', adminSessionSchema);
