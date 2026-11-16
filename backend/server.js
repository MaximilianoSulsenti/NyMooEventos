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
const backupRoutes = require('./routes/backupRoutes');
const orderRoutes = require('./routes/orderRoutes');
const taskRoutes = require('./routes/taskRoutes');
const systemRoutes = require('./routes/systemRoutes');
const matchRoutes = require('./routes/matchRoutes');
const Event = require('./models/Event');
const MatchProfile = require('./models/MatchProfile');
const { startReminderCron } = require('./jobs/reminderCron');

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
// Detrás de un proxy (Render), sin esto req.ip es siempre la IP del proxy --
// TODOS los limiters por IP existentes terminarían compartiendo un único
// balde entre absolutamente todos los visitantes. "1" confía en un solo
// salto de proxy, que es el caso real acá.
app.set('trust proxy', 1);

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
app.use('/api/backup', backupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/match', matchRoutes);

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
      layout: ['single', 'carousel3d'].includes(layout) ? layout : 'grid',
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

  // Wedding Match: valida el token opaco del invitado contra la DB antes de
  // unirlo a sus rooms privados -- a diferencia de los handlers de arriba,
  // esto hace una consulta async, y express-async-errors no cubre sockets,
  // así que el try/catch es manual. Falla en silencio ante un token
  // inválido (nunca manda un error al cliente por esto).
  socket.on('join-match', async ({ eventSlug, token }) => {
    try {
      if (!eventSlug || !token) return;
      const event = await Event.findOne({ eventSlug });
      if (!event?.activeModules?.weddingMatch) return;
      const profile = await MatchProfile.findOne({ eventId: event._id, deviceToken: token });
      if (!profile) return;
      socket.join(`match:${eventSlug}`);
      socket.join(`match-profile:${profile._id}`);
    } catch (err) {
      console.error('[Socket.io] Error en join-match:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  startReminderCron();
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
