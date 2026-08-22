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
