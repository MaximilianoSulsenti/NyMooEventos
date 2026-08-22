import {
  Info as InfoIcon,
  Shirt,
  Hotel,
  Car,
  Gift,
  Baby,
  Utensils,
  Phone,
  Church,
  PartyPopper,
  Music,
  Camera,
  Clock,
  MapPin,
  CalendarHeart,
  Sparkles,
  Wine,
  Users,
  Heart,
} from 'lucide-react'

export const EVENT_ICONS = {
  info: InfoIcon,
  dresscode: Shirt,
  hotel: Hotel,
  transport: Car,
  gift: Gift,
  kids: Baby,
  food: Utensils,
  contact: Phone,
  church: Church,
  party: PartyPopper,
  music: Music,
  photo: Camera,
  clock: Clock,
  location: MapPin,
  celebration: Sparkles,
  toast: Wine,
  couple: Heart,
  guests: Users,
  date: CalendarHeart,
}

export const EVENT_ICON_OPTIONS = [
  { value: 'info', label: 'Información general' },
  { value: 'dresscode', label: 'Código de vestimenta' },
  { value: 'hotel', label: 'Alojamiento / hoteles' },
  { value: 'transport', label: 'Transporte' },
  { value: 'gift', label: 'Regalos' },
  { value: 'kids', label: 'Niños' },
  { value: 'food', label: 'Comida / menú' },
  { value: 'contact', label: 'Contacto' },
  { value: 'church', label: 'Iglesia / ceremonia' },
  { value: 'party', label: 'Fiesta / recepción' },
  { value: 'music', label: 'Música / baile' },
  { value: 'photo', label: 'Fotos' },
  { value: 'clock', label: 'Horario' },
  { value: 'location', label: 'Ubicación' },
  { value: 'celebration', label: 'Celebración' },
  { value: 'toast', label: 'Brindis' },
  { value: 'couple', label: 'Pareja / amor' },
  { value: 'guests', label: 'Invitados' },
  { value: 'date', label: 'Fecha' },
]

// Detección automática por palabra clave: si el texto menciona "nos casamos",
// "iglesia" o "ceremonia", se sugiere el ícono de iglesia, etc.
const AUTO_ICON_RULES = [
  { icon: 'church', pattern: /(iglesia|ceremonia|civil|nos casamos|religios)/ },
  { icon: 'party', pattern: /(recepcion|recepción|fiesta|salon|salón)/ },
  { icon: 'food', pattern: /(cena|almuerzo|brindis|menu|menú)/ },
  { icon: 'music', pattern: /(baile|musica|música|\bdj\b)/ },
  { icon: 'photo', pattern: /(foto)/ },
  { icon: 'gift', pattern: /(regalo)/ },
  { icon: 'hotel', pattern: /(hotel|alojamiento|hosped)/ },
  { icon: 'transport', pattern: /(transporte|traslado|combi|van)/ },
  { icon: 'dresscode', pattern: /(vestimenta|dress ?code)/ },
  { icon: 'kids', pattern: /(niñ|kids|infantil)/ },
]

export function pickIconKey(text = '') {
  const normalized = text.toLowerCase()
  const match = AUTO_ICON_RULES.find((rule) => rule.pattern.test(normalized))
  return match ? match.icon : null
}

export function resolveIcon(key, fallbackText = '', defaultKey = 'info') {
  const resolvedKey = key || pickIconKey(fallbackText) || defaultKey
  return EVENT_ICONS[resolvedKey] || EVENT_ICONS[defaultKey]
}
