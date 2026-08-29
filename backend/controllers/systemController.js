const { getCloudinaryUsage } = require('../services/cloudinaryUsage');

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

module.exports = { getCloudinaryUsageStatus };
