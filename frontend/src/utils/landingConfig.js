import { BRAND } from './brand'

// Datos comerciales de la landing pública -- EDITAR ACÁ para actualizar el
// número de WhatsApp, el Instagram y los packs en toda la página de una
// sola vez.
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

const PAYMENT_NOTE = 'Se seña con el 50% · hasta 3 cuotas con Mercado Pago'

export const LANDING_PACKS = [
  {
    id: 'invita',
    name: 'Nymoo INVITA',
    tagline: 'Plan inicial',
    price: '$50.000',
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.blue,
    features: [
      'Tarjeta digital interactiva 100% personalizada',
      'Música de fondo y galería de fotos de los anfitriones',
      'Cuenta regresiva animada',
      'Ubicación integrada con Google Maps',
      'Detalles del evento e historia interactiva (hitos de la pareja o del homenajeado)',
      'Información adicional y cronograma de la fiesta',
      'Lista de regalos / colecta de dinero mediante alias o CBU',
      'Confirmación de asistencia (RSVP) enviada directo a WhatsApp',
      'Entrega garantizada en menos de 3 días',
      'Soporte prioritario el día del evento',
    ],
  },
  {
    id: 'conecta',
    name: 'Nymoo CONECTA',
    tagline: 'Plan recomendado',
    price: '$70.000',
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.violet,
    recommended: true,
    includesFrom: 'Nymoo INVITA',
    features: [
      'Confirmación de asistencia (RSVP) por formulario en base de datos',
      'Acceso al panel de estadísticas de invitados en vivo',
      'Carrusel de fotos premium (novios o homenajeado)',
      'Fotos específicas del salón y la iglesia',
      'Álbum colaborativo por QR (hasta 400 fotos)',
      'Entrega al día siguiente del álbum completo descargable (solo fotos)',
      'Playlist colaborativa de música',
      'Integración con el Instagram del evento',
      'Soporte prioritario el día del evento',
    ],
  },
  {
    id: 'vive',
    name: 'Nymoo VIVE',
    tagline: 'Experiencia premium',
    price: '$100.000',
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.pink,
    includesFrom: 'Nymoo CONECTA',
    features: [
      'Confirmación de asistencia VIP con invitaciones personalizadas (pase individual con control estricto de cupos por familia/invitado)',
      'Panel de invitados VIP habilitado para personalizar los nombres desde las estadísticas en vivo',
      'Álbum colaborativo por QR mejorado: hasta 600 fotos y 80 videos cortos (máximo 15 segundos)',
      'Panel de moderación de contenidos en tiempo real (automático o manual)',
      'Control de reproducción de pantalla con Modo Fiesta activo',
      'Pantalla en vivo (Live Feed) para proyectar fotos, videos y dedicatorias en el salón',
      'Libro de firmas digital integrado (comentarios que los invitados envían con su foto)',
      'Descarga instantánea del álbum multimedia en el mismo momento del evento',
      'Carrusel tridimensional 3D premium para las fotos de los anfitriones',
      'Soporte prioritario el día del evento',
    ],
  },
  {
    id: 'vision',
    name: 'Nymoo VISIÓN',
    tagline: 'Producto independiente',
    price: '$60.000',
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.orange,
    banner: '¡Ideal si ya tenés tu invitación digital de otro proveedor y solo querés la pantalla en vivo para tu fiesta!',
    features: [
      'Pack exclusivo de álbum por QR colaborativo para subir fotos y videos cortos',
      'Capacidad total de 600 fotos y 80 videos de 15 segundos',
      'Proyección multimedia en tiempo real en la pantalla del salón',
      'Panel de moderación avanzado para el cliente (control manual, automático o semiautomático)',
      'Interruptor en tiempo real para activar el Modo Fiesta',
      'Libro de firmas digital descargable (recopilación de dedicatorias de los invitados al subir sus archivos)',
      'Álbum multimedia descargable de forma directa desde el panel de moderación',
      'Soporte prioritario el día del evento',
    ],
  },
]
