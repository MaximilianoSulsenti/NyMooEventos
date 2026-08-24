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
  guestCardDetails: { hasCost: false, pricePerCard: '', includesMenuDetails: '', paymentInstructions: '' },
  additionalInfo: { dressCode: '', bankDetails: '', importantTips: '' },
}
