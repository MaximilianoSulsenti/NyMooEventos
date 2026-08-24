const mongoose = require('mongoose');

// Contador atómico genérico (findOneAndUpdate + $inc es atómico en Mongo,
// a diferencia de contar documentos existentes, que puede pisarse con
// pedidos creados en simultáneo). Se usa para numerar pedidos de forma
// secuencial y legible (#NYM-2026-001, -002, ...).
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
