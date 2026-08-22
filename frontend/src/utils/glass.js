const BLUR_CLASS = { none: '', sm: 'backdrop-blur-sm', md: 'backdrop-blur-md', lg: 'backdrop-blur-lg' }

export function glassBlurClass(config) {
  return BLUR_CLASS[config?.glassBlur] ?? BLUR_CLASS.sm
}

// opacidad expresada en porcentaje (0-20 sugerido). boost permite oscurecer/aclarar
// levemente en estados como "abierto" sin agregar otro campo editable.
export function glassStyle(config, { boost = 0 } = {}) {
  const opacity = Math.max(0, (config?.glassOpacity ?? 4) + boost)
  const borderOpacity = Math.min(40, opacity + 7)
  return {
    backgroundColor: `rgba(255,255,255,${opacity / 100})`,
    borderColor: `rgba(255,255,255,${borderOpacity / 100})`,
  }
}
