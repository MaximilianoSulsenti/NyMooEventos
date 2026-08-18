const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`[Config] Faltan variables de entorno requeridas: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = validateEnv;
