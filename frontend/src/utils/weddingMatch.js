// Espejo de MatchProfile.VIBES en el backend (backend/models/MatchProfile.js)
// -- whitelist, no texto libre, así el chip más visible de la tarjeta nunca
// necesita pasar por moderación.
export const VIBES = [
  'Bailar',
  'Fernet',
  'Asado',
  'Viajar',
  'Gym',
  'Series',
  'Mate',
  'Fútbol',
  'Música en vivo',
  'Perros',
  'Gatos',
  'Tragos',
  'Cumbia',
  'Rock',
  'Playa',
]

export const GENDER_OPTIONS = [
  { value: '', label: 'Prefiero no decir' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'varon', label: 'Varón' },
  { value: 'otro', label: 'Otro' },
]

export const INTERESTED_IN_OPTIONS = [
  { value: 'todas', label: 'Todas las personas' },
  { value: 'mujeres', label: 'Mujeres' },
  { value: 'varones', label: 'Varones' },
]

// Acento romántico LOCAL de este módulo -- a propósito no se agrega a
// utils/brand.js (esa paleta es solo para pantallas propias de la
// plataforma, ver el comentario en ese archivo). Dorado/rosa champán para
// la identidad "dating app de casamiento", sin pisar el tema que haya
// elegido el evento (que sigue siendo quien manda en fondo/tipografía,
// ver WeddingMatch.jsx).
export const MATCH_ACCENT = {
  gold: '#e8b34f',
  blush: '#f2a6c6',
  deepRose: '#c23f72',
}

function storageKey(eventSlug) {
  return `nymoo_match_${eventSlug}`
}

// Todo acceso a localStorage en try/catch -- en modo privado puede tirar
// (ver UploadPhotosForm.jsx), y acá además es la única forma de "resumir"
// sin repetir el formulario, así que un error silencioso es mejor que
// romper la carga de la página.
export function readMatchToken(eventSlug) {
  try {
    return localStorage.getItem(storageKey(eventSlug)) || ''
  } catch {
    return ''
  }
}

export function writeMatchToken(eventSlug, token) {
  try {
    localStorage.setItem(storageKey(eventSlug), token)
  } catch {
    // no es crítico -- en el peor caso, la próxima visita vuelve a pedir el onboarding.
  }
}

export function clearMatchToken(eventSlug) {
  try {
    localStorage.removeItem(storageKey(eventSlug))
  } catch {
    // ídem arriba.
  }
}

export function isValidAge(age) {
  const n = Number(age)
  return Number.isInteger(n) && n >= 18 && n <= 99
}

// El backend ya normaliza y guarda el whatsapp en formato wa.me-listo
// (549XXXXXXXXXX) -- acá solo se arma el link con el mensaje prearmado, sin
// volver a tocar el número.
export function buildWaLink(digits, myName, eventName) {
  const text = `¡Hola! Soy ${myName} 👋 Hicimos match en Wedding Match de ${eventName || 'la boda'} 💛`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
