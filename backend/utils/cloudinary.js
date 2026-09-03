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

module.exports = { extractPublicIdFromUrl };
