const THEME_STYLES = {
  minimalista: {
    fontClass: 'font-sans',
    heading: 'font-light tracking-wide',
    sectionWrapper: 'py-16 px-6',
    card: 'rounded-lg',
    divider: 'w-12 h-px',
  },
  moderno: {
    fontClass: 'font-sans',
    heading: 'font-bold tracking-tight uppercase',
    sectionWrapper: 'py-14 px-6',
    card: 'rounded-xl',
    divider: 'w-16 h-1',
  },
  vanguardista: {
    fontClass: 'font-sans',
    heading: 'font-black tracking-tight',
    sectionWrapper: 'py-16 px-6 first:pl-6 odd:pl-10 even:pr-10',
    card: 'rounded-none',
    divider: 'w-20 h-1 skew-x-12',
  },
  romantica: {
    fontClass: 'font-serif',
    heading: 'font-normal italic',
    sectionWrapper: 'py-16 px-6',
    card: 'rounded-3xl',
    divider: 'w-12 h-px',
  },
  bohemio: {
    fontClass: 'font-serif',
    heading: 'font-light italic tracking-wide',
    sectionWrapper: 'py-16 px-6',
    card: 'rounded-3xl',
    divider: 'w-16 h-px',
  },
  elegante: {
    fontClass: 'font-display',
    heading: 'font-semibold tracking-[0.15em] uppercase',
    sectionWrapper: 'py-16 px-6',
    card: 'rounded-none border border-white/20',
    divider: 'w-24 h-px',
  },
  festivo: {
    fontClass: 'font-modern',
    heading: 'font-extrabold tracking-tight',
    sectionWrapper: 'py-14 px-6',
    card: 'rounded-full',
    divider: 'w-16 h-2 rounded-full',
  },
}

export const FONT_FAMILY_CLASSES = {
  sans: 'font-sans',
  serif: 'font-serif',
  display: 'font-display',
  script: 'font-script',
  modern: 'font-modern',
  greatvibes: 'font-greatvibes',
  cormorant: 'font-cormorant',
  bebas: 'font-bebas',
  chewy: 'font-chewy',
}

// titleFontFamily es opcional -- vacío/no elegido usa la misma tipografía
// que el resto del texto (el `heading` de la base ya trae solo peso/tracking,
// sin font-family propia, así que hereda el fontClass del contenedor). Si se
// elige una, se agrega esa clase directo en `heading` -- como se aplica en el
// propio <h2>/<h1> de cada sección, gana por sobre lo heredado del wrapper
// sin tener que tocar los ~15 archivos de sección uno por uno.
export function getThemeStyles(theme, fontFamily, titleFontFamily) {
  const base = THEME_STYLES[theme] || THEME_STYLES.minimalista
  const fontOverride = fontFamily && FONT_FAMILY_CLASSES[fontFamily]
  const titleFontOverride = titleFontFamily && FONT_FAMILY_CLASSES[titleFontFamily]
  return {
    ...base,
    fontClass: fontOverride || base.fontClass,
    heading: titleFontOverride ? `${base.heading} ${titleFontOverride}` : base.heading,
  }
}
