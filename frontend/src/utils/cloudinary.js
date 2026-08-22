// Inserta transformaciones de Cloudinary en una URL de entrega ya existente,
// sin volver a subir nada. f_auto/q_auto dejan que Cloudinary elija el mejor
// formato (webp/avif) y calidad para cada navegador, y w_/c_limit evita
// mandar el archivo a resolución completa cuando se muestra chico
// (miniaturas de moderación, previews, etc.) — así se ahorra ancho de banda
// real sin perder calidad visible.
function withTransform(url, transformation) {
  if (!url || typeof url !== 'string' || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transformation}/`)
}

// Miniatura chica (grillas de moderación, previews dentro de la tarjeta).
export function cloudinaryThumb(url, width = 300) {
  return withTransform(url, `f_auto,q_auto,w_${width},c_limit`)
}

// Tamaño grande para pantalla completa (pantalla en vivo). El tope es 2000px
// porque las fotos ya se comprimen a ese máximo en el celular antes de subir
// (ver UploadPhotosForm) — así este límite nunca recorta resolución real, solo
// evita reprocesar de más si algún día ese máximo cambia.
export function cloudinaryLarge(url, width = 2000) {
  return withTransform(url, `f_auto,q_auto,w_${width},c_limit`)
}
