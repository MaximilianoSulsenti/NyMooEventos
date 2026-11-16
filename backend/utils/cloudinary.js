// Cloudinary no guarda el public_id en ningún lado accesible desde la URL
// pública directamente -- hay que reconstruirlo sacando la parte entre
// "/upload/" (saltando el "v123456/" de versión si está) y la extensión
// del archivo. Compartido entre fotos de galería y las imágenes/videos de
// apariencia (fondo global, fondo por sección, sobre de bienvenida), que
// necesitan lo mismo para poder borrar el asset real al reemplazarlo o
// quitarlo, no solo desvincularlo del documento.
function extractPublicIdFromUrl(url) {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Evita que un cliente registre como propia una URL de imagen/video
// arbitraria (de otro lado, o de otro evento/carpeta) -- solo se acepta una
// URL que realmente salió de ESTA cuenta de Cloudinary, dentro de la
// carpeta exacta que el propio backend le indicó al firmar la subida.
// Compartido entre fotos de galería (photoController.js) y cualquier otro
// módulo que suba archivos directo a Cloudinary (ej. Wedding Match).
function isTrustedCloudinaryUrl(url, folder, resourceType = 'image') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch {
    return false;
  }
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${escapeRegex(cloudName)}/${resourceType}/upload/.+/${escapeRegex(folder)}/[^/]+$`
  );
  return pattern.test(decodedUrl);
}

module.exports = { extractPublicIdFromUrl, isTrustedCloudinaryUrl };
