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
