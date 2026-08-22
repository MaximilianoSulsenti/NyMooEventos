require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');
const guestRoutes = require('./routes/guestRoutes');
const eventRoutes = require('./routes/eventRoutes');

validateEnv();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : '*';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/events', eventRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador inválido' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'El recurso ya existe' });
  }

  res.status(500).json({ message: 'Error interno del servidor' });
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

  socket.on('join-event', (eventSlug) => {
    socket.join(eventSlug);
  });

  socket.on('set-party-config', ({ eventSlug, enabled, layout, confetti, lightBeams, emojiRain }) => {
    if (!eventSlug) return;
    io.to(eventSlug).emit('party-config-changed', {
      enabled: Boolean(enabled),
      layout: layout === 'single' ? 'single' : 'grid',
      confetti: Boolean(confetti),
      lightBeams: Boolean(lightBeams),
      emojiRain: Boolean(emojiRain),
    });
  });

  socket.on('set-speed', ({ eventSlug, seconds }) => {
    if (!eventSlug) return;
    const clamped = Math.min(15, Math.max(2, Number(seconds) || 7));
    io.to(eventSlug).emit('speed-changed', clamped);
  });

  socket.on('toggle-pause', ({ eventSlug, paused }) => {
    if (!eventSlug) return;
    io.to(eventSlug).emit('pause-changed', Boolean(paused));
  });

  socket.on('set-announcement', ({ eventSlug, text, position, fontSize }) => {
    if (!eventSlug) return;
    io.to(eventSlug).emit('announcement-changed', {
      text: String(text || '').slice(0, 140),
      position: ['top', 'center', 'bottom'].includes(position) ? position : 'bottom',
      fontSize: fontSize || 'text-xl',
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] Escuchando en el puerto ${PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`[Server] Señal ${signal} recibida, cerrando de forma ordenada...`);

  server.close(async () => {
    await mongoose.connection.close();
    console.log('[Server] Conexiones cerradas, proceso finalizado');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
