const zlib = require('zlib');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const Guest = require('../models/Guest');

// Se sobreescribe siempre el mismo archivo: es un backup "último estado",
// no un historial. Alcanza para el objetivo (no perder todo si Mongo falla),
// no reemplaza un backup real con recuperación punto-en-el-tiempo (eso lo da
// el plan pago de Atlas).
const BACKUP_PUBLIC_ID = 'nymoo_backups/latest';

async function runBackup(req, res) {
  if (!process.env.BACKUP_SECRET || req.headers['x-backup-secret'] !== process.env.BACKUP_SECRET) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const [users, events, photos, guests] = await Promise.all([
    User.find().lean(),
    Event.find().lean(),
    Photo.find().lean(),
    Guest.find().lean(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: { users: users.length, events: events.length, photos: photos.length, guests: guests.length },
    collections: { users, events, photos, guests },
  };

  const gzipped = zlib.gzipSync(Buffer.from(JSON.stringify(payload)));

  await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        type: 'private',
        public_id: BACKUP_PUBLIC_ID,
        overwrite: true,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(gzipped);
  });

  console.log(`[Backup] Generado (${JSON.stringify(payload.counts)})`);
  res.json({ message: 'Backup generado', exportedAt: payload.exportedAt, counts: payload.counts });
}

async function getBackupDownloadUrl(req, res) {
  const url = cloudinary.utils.private_download_url(BACKUP_PUBLIC_ID, '', {
    resource_type: 'raw',
    type: 'private',
    expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutos
  });

  res.json({ url });
}

module.exports = { runBackup, getBackupDownloadUrl };
