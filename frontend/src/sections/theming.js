const THEME_STYLES = {
  minimalista: {
    fontClass: 'font-sans',
    heading: 'font-light tracking-wide',
    sectionWrapper: 'py-16 px-6 border-t border-white/10',
    card: 'rounded-lg',
    divider: 'w-12 h-px',
  },
  moderno: {
    fontClass: 'font-sans',
    heading: 'font-bold tracking-tight uppercase',
    sectionWrapper: 'py-14 px-6 border-t-2 border-white/10',
    card: 'rounded-xl',
    divider: 'w-16 h-1',
  },
  vanguardista: {
    fontClass: 'font-sans',
    heading: 'font-black tracking-tight',
    sectionWrapper: 'py-16 px-6 first:pl-6 odd:pl-10 even:pr-10 border-t border-white/10',
    card: 'rounded-none',
    divider: 'w-20 h-1 skew-x-12',
  },
  romantica: {
    fontClass: 'font-serif',
    heading: 'font-normal italic',
    sectionWrapper: 'py-16 px-6 border-t border-white/10',
    card: 'rounded-3xl',
    divider: 'w-12 h-px',
  },
}

export function getThemeStyles(theme) {
  return THEME_STYLES[theme] || THEME_STYLES.minimalista
}
