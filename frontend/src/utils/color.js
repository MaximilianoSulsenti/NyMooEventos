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
// de una sección. Sin un color propio elegido (textColorSecondary vacío),
// hereda el MISMO color del título (textColor) con menos opacidad para la
// jerarquía visual, en vez de quedar pegado en blanco fijo sin importar el
// fondo -- esa es la única situación donde tiene sentido apagarlo, porque
// ahí el color "pertenece" al título y el subtítulo solo lo toma prestado.
// Con un color PROPIO elegido a mano (isExplicit=true), se respeta tal
// cual -- apagarlo ahí no tiene sentido: el usuario ya eligió a propósito
// ese tono exacto para el subtítulo, no una versión atenuada de otra cosa.
// opacityHex es el sufijo alfa de dos dígitos en hex (ej. "b3" ~70%, "99"
// ~60%, "80" ~50%), ignorado cuando isExplicit es true.
export function secondaryTextColor(textColor, opacityHex, isExplicit = false) {
  if (!textColor) return `#ffffff${opacityHex}`
  return isExplicit ? textColor : `${textColor}${opacityHex}`
}

// Fondo "vidriado" opcional detrás de un texto secundario -- pensado para
// cuando el fondo de la sección es un video/imagen y el texto se pierde en
// algún momento. El tinte se calcula por contraste contra el propio color
// del texto (getContrastTextColor), nunca fijo, así siempre se lee bien sin
// importar qué combinación de colores se elija. La opacidad del tinte es
// editable (ver config.textGlassOpacity en TEXT_FIELD_DEFS); sin elegir
// nada cae a 25%, a propósito bastante más marcada que un glassmorphism
// típico -- con un fondo real de foto/video de por medio, un vidrio
// demasiado sutil no alcanza a tapar lo suficiente como para garantizar
// lectura; la sombra exterior oscura suma separación del fondo sin
// depender del color elegido.
export function secondaryGlassStyle(secondaryColor, opacityPercent) {
  const tint = getContrastTextColor(secondaryColor || '#ffffff')
  const [r, g, b] = hexToRgb(tint)
  const opacity = Math.min(100, Math.max(0, opacityPercent ?? 25))
  const alpha = (delta) => Math.min(100, Math.max(0, opacity + delta)) / 100
  // backgroundColor, no el shorthand "background" -- el título en modo
  // degradado pinta su relleno con backgroundImage (ver titleTextStyle), y
  // el shorthand "background" resetea backgroundImage a "none" cuando se
  // mezcla después en el mismo style, lo que deja el texto invisible
  // (color ya es transparent ahí). backgroundColor no toca backgroundImage.
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha(0)})`,
    border: `1px solid rgba(${r}, ${g}, ${b}, ${alpha(5)})`,
    boxShadow: `inset 0 1px 0 rgba(${r}, ${g}, ${b}, ${alpha(-5)}), inset 0 -1px 0 rgba(${r}, ${g}, ${b}, ${alpha(-15)}), 0 4px 20px -4px rgba(0,0,0,0.35)`,
  }
}

// Style para el título principal de una sección -- degradado de dos colores
// (background-clip: text) si está activado y ambos colores están cargados,
// si no el color simple de siempre. Pensado como reemplazo directo de
// { color: config.textColor || undefined } en el <h1>/<h2> de cada sección.
export function titleTextStyle(config) {
  if (config.titleColorMode === 'degradado' && config.titleGradientFrom && config.titleGradientTo) {
    // "De izquierda a derecha" por defecto, no "de arriba a abajo" -- un
    // título normal es una sola línea de ~30px de alto, así que un
    // degradado vertical ahí casi no se nota (se ve prácticamente sólido);
    // horizontal sí se aprecia incluso en títulos cortos.
    return {
      backgroundImage: `linear-gradient(${config.titleGradientDirection || 'to right'}, ${config.titleGradientFrom}, ${config.titleGradientTo})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
    }
  }
  return { color: config.textColor || undefined }
}

// Color de referencia para el contraste del vidrio del TÍTULO (ver
// secondaryGlassStyle) -- en modo degradado no hay un solo "color de
// texto" real (el relleno visual es el degradado, color queda
// transparent), así que se usa el primer color del degradado como
// referencia. Secciones sin degradado (ej. Footer) ni config.titleColorMode
// caen directo a config.textColor, sin cambios.
export function titleGlassColor(config) {
  if (config.titleColorMode === 'degradado') {
    return config.titleGradientFrom || config.titleGradientTo || config.textColor
  }
  return config.textColor
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
