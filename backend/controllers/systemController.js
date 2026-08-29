const { getCloudinaryUsage } = require('../services/cloudinaryUsage');
const { runReminderSweep } = require('../jobs/reminderCron');

// A partir de qué porcentaje del plan de Cloudinary se considera
// "atención"/"crítico" -- ver OrdersDashboard.jsx, que pinta el aviso en
// amarillo o rojo según este mismo corte para que el admin lo note apenas
// entra al panel, sin tener que ir a buscarlo a otro lado.
const WARN_THRESHOLD = 70;
const CRITICAL_THRESHOLD = 90;

function levelFor(usedPercent) {
  if (usedPercent >= CRITICAL_THRESHOLD) return 'critical';
  if (usedPercent >= WARN_THRESHOLD) return 'warning';
  return 'ok';
}

async function getCloudinaryUsageStatus(req, res) {
  const usage = await getCloudinaryUsage();
  res.json({ ...usage, level: levelFor(usage.usedPercent) });
}

// Disparado por un workflow programado de GitHub Actions cada 10 minutos
// (mismo patrón que /api/backup/run) -- el cron interno de node-cron
// (jobs/reminderCron.js) solo corre mientras el proceso está vivo, y el
// plan gratis de Render duerme el backend a los 15 minutos sin tráfico.
// Sin este disparador externo, un recordatorio programado de noche o sin
// visitas al sitio podía tardar horas en salir (recién cuando algo
// despertaba al servidor solo). Reusa BACKUP_SECRET a propósito -- es la
// misma categoría de cosa (automatización servidor-a-servidor sin usuario
// logueado del otro lado), no hace falta cargar un secreto nuevo en Render.
async function runReminderSweepNow(req, res) {
  if (!process.env.BACKUP_SECRET || req.headers['x-backup-secret'] !== process.env.BACKUP_SECRET) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  const resolvedCount = await runReminderSweep();
  res.json({ resolvedCount });
}

module.exports = { getCloudinaryUsageStatus, runReminderSweepNow };
