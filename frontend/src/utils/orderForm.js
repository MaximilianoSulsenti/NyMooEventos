export const EVENT_TYPE_OPTIONS = [
  'Boda',
  'Quince Años',
  'Cumpleaños',
  'Bautismo',
  'Comunión',
  'Egresados',
  'Baby Shower',
  'Corporativo',
  'Otro',
]

export const THEME_OPTIONS = ['Romántica', 'Vanguardista', 'Minimalista', 'Moderna']

export const TYPOGRAPHY_OPTIONS = [
  'Sans-serif',
  'Serif',
  'Elegante (Playfair Display)',
  'Manuscrita (Dancing Script)',
  'Moderna (Poppins)',
]

// Clase real de cada tipografía sugerida, para mostrar una vista previa en
// vivo con la letra que le corresponde (mismas fuentes que ya carga toda la
// plataforma, ver index.html/index.css) en vez de solo un nombre en texto.
export const TYPOGRAPHY_PREVIEW_CLASS = {
  'Sans-serif': 'font-sans',
  Serif: 'font-serif',
  'Elegante (Playfair Display)': 'font-display',
  'Manuscrita (Dancing Script)': 'font-script',
  'Moderna (Poppins)': 'font-modern',
}

export const CUSTOM_TYPOGRAPHY_VALUE = '__otra__'

// Paleta con nombres para elegir color "a ojo" en vez de tener que pensar en
// hex -- son sugerencias, el input de color de al lado sigue permitiendo
// cualquier tono exacto.
export const COLOR_PRESETS = [
  { name: 'Rosa pastel', hex: '#F3D9D6' },
  { name: 'Dorado', hex: '#C9A227' },
  { name: 'Terracota', hex: '#C1694F' },
  { name: 'Verde salvia', hex: '#A3B18A' },
  { name: 'Esmeralda', hex: '#0B6E4F' },
  { name: 'Azul noche', hex: '#1F2A44' },
  { name: 'Borgoña', hex: '#6D1E33' },
  { name: 'Lavanda', hex: '#C9B8DB' },
  { name: 'Marfil', hex: '#F4EFE6' },
  { name: 'Blanco puro', hex: '#FFFFFF' },
  { name: 'Negro elegante', hex: '#111111' },
  { name: 'Coral', hex: '#FF6F61' },
]

export const EMPTY_ORDER_FORM = {
  clientData: { name: '', phone: '', email: '' },
  eventData: { protagonists: '', eventType: '', date: '', time: '', locations: '' },
  designPresets: {
    theme: '',
    typography: '',
    primaryColor: '#a855f7',
    secondaryColor: '#111827',
    tertiaryColor: '#ffffff',
    customBgInstructions: '',
  },
  // pricePerCard es texto libre a propósito (ej: "$15.000", "USD 20",
  // "a confirmar") -- no todos los organizadores tienen un número cerrado
  // todavía, y forzar un input numérico los frenaba.
  guestCardDetails: { hasCost: false, pricePerCard: '', includesMenuDetails: '', paymentInstructions: '' },
  additionalInfo: { dressCode: '', bankDetails: '', importantTips: '' },
}
