import { BRAND } from './brand'

// Datos comerciales de la landing pública -- EDITAR ACÁ para actualizar el
// número de WhatsApp, el Instagram y los precios en toda la página de una
// sola vez. Los valores de acá abajo son PLACEHOLDERS: reemplazalos por los
// datos reales del negocio antes de lanzar la landing a producción.
export const LANDING_CONTACT = {
  // TODO: reemplazar por el número real en formato wa.me (código de país +
  // área + número, sin 0 ni 15). Ejemplo Argentina/Buenos Aires: 5491122334455
  whatsappNumber: '5491100000000',
  // TODO: reemplazar por el link real de Instagram del negocio
  instagramUrl: 'https://instagram.com/nymoo.eventos',
}

// Arma un link de WhatsApp con mensaje pre-cargado, igual que en el resto de
// la plataforma (ver RsvpForm.jsx) -- separado acá porque la landing no tiene
// un evento real detrás para reusar ese helper.
export function buildWhatsappUrl(message, number = LANDING_CONTACT.whatsappNumber) {
  const digits = (number || '').replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export const LANDING_PACKS = [
  {
    id: 'basica',
    name: 'Pack Invitación Básica',
    tagline: 'Tu invitación digital interactiva, lista para compartir',
    price: '$15.000', // TODO: reemplazar por el precio real
    accentColor: BRAND.blue,
    features: [
      'Tarjeta digital interactiva y 100% personalizada',
      'Cuenta regresiva, ubicación con mapa y detalles del evento',
      'Confirmación de asistencia (RSVP) por WhatsApp',
      'Entrega en menos de 3 días',
    ],
  },
  {
    id: 'album',
    name: 'Pack Álbum Digital Colectivo',
    tagline: 'Todos los invitados suman sus fotos al instante',
    price: '$22.000', // TODO: reemplazar por el precio real
    accentColor: BRAND.violet,
    features: [
      'Todo lo del Pack Invitación Básica',
      'Álbum colaborativo: los invitados suben fotos por código QR',
      'Moderación de fotos antes de que se publiquen',
      'Descarga del álbum completo después del evento',
    ],
  },
  {
    id: 'premium',
    name: 'Pack Premium Proyector en Vivo',
    tagline: 'Las fotos de tus invitados, en pantalla, en tiempo real',
    price: '$35.000', // TODO: reemplazar por el precio real
    accentColor: BRAND.pink,
    features: [
      'Todo lo del Pack Álbum Digital Colectivo',
      'Pantalla en vivo para proyectar en el salón',
      'Modo Fiesta con efectos: confetti, luces y lluvia de emojis',
      'Soporte prioritario el día del evento',
    ],
  },
]
