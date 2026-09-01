function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized
  const int = parseInt(value, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

// percent: positivo aclara, negativo oscurece (rango sugerido -100 a 100)
export function shadeColor(hex, percent) {
  try {
    const [r, g, b] = hexToRgb(hex)
    const amount = (percent / 100) * 255
    const clamp = (v) => Math.min(255, Math.max(0, v + amount))
    return rgbToHex(clamp(r), clamp(g), clamp(b))
  } catch {
    return hex
  }
}

function relativeLuminance(r, g, b) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

// Elige negro o blanco según cuál da más contraste real (WCAG) contra el color
// de fondo dado — evita texto "sucio" en colores intermedios como un azul saturado.
export function getContrastTextColor(hex) {
  try {
    const [r, g, b] = hexToRgb(hex)
    const luminance = relativeLuminance(r, g, b)
    const contrastWithBlack = (luminance + 0.05) / 0.05
    const contrastWithWhite = 1.05 / (luminance + 0.05)
    return contrastWithBlack >= contrastWithWhite ? '#111111' : '#ffffff'
  } catch {
    return '#111111'
  }
}

// Color de un texto secundario (subtítulo, cuerpo, dedicatoria/lema) dentro
// de una sección -- toma el MISMO color elegido para el título de esa
// sección (textColor, ver TEXT_FIELD_DEFS en sectionDefs.js) con menos
// opacidad para la jerarquía visual, en vez de quedar pegado en blanco fijo
// sin importar el fondo. Sin textColor elegido, cae al blanco de siempre
// (mismo comportamiento que había antes de este helper). opacityHex es el
// sufijo alfa de dos dígitos en hex (ej. "b3" ~70%, "99" ~60%, "80" ~50%).
export function secondaryTextColor(textColor, opacityHex) {
  return `${textColor || '#ffffff'}${opacityHex}`
}

// Promedia los píxeles de una imagen/video ya cargado (achicado a un canvas
// chico primero, para que sea rápido) y devuelve un color representativo.
// Se usa para el telón de fondo del sobre de bienvenida: que acompañe los
// tonos reales de la foto/video que subió el cliente (ej. sepia de un
// sobre envejecido), en vez de quedar siempre atado a un color elegido a
// mano aparte.
function averageColorFromSource(source, width, height) {
  const size = 24
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0, width, height, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count++
  }
  return rgbToHex(r / count, g / count, b / count)
}

// crossOrigin='anonymous' funciona sin problemas contra Cloudinary (ya
// manda los headers CORS permisivos por defecto) -- si algún día se sube
// una URL de otro origen que no los mande, el canvas queda "tainted" y
// getImageData tira, por eso todo esto siempre se usa con un .catch() que
// cae de vuelta al color elegido a mano.
export function extractDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        resolve(averageColorFromSource(img, img.naturalWidth, img.naturalHeight))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = imageUrl
  })
}

export function extractDominantColorFromVideo(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.addEventListener(
      'loadeddata',
      () => {
        try {
          resolve(averageColorFromSource(video, video.videoWidth, video.videoHeight))
        } catch (err) {
          reject(err)
        }
      },
      { once: true }
    )
    video.addEventListener('error', () => reject(new Error('No se pudo cargar el video')), { once: true })
    video.src = videoUrl
  })
}
