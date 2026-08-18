const mongoose = require('mongoose');

async function connectDB() {
  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Conectado: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error de conexión:', err.message);
  });

  await mongoose.connect(process.env.MONGO_URI);
}

module.exports = connectDB;
