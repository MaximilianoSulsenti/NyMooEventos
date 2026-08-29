// Consulta el uso actual del plan de Cloudinary (API de administración,
// endpoint /usage) -- separado de cloudinary.js (el cliente que sube fotos)
// porque este es de solo lectura y lo usa un endpoint distinto, pensado para
// el panel de administración (ver routes/systemRoutes.js).
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

async function getCloudinaryUsage() {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Cloudinary usage API respondió ${response.status}`);
  }

  const data = await response.json();

  return {
    plan: data.plan,
    usedPercent: data.credits?.used_percent ?? 0,
    creditsUsage: data.credits?.usage ?? 0,
    creditsLimit: data.credits?.limit ?? 0,
    storageBytes: data.storage?.usage ?? 0,
    bandwidthBytes: data.bandwidth?.usage ?? 0,
    resources: data.resources ?? 0,
  };
}

module.exports = { getCloudinaryUsage };
