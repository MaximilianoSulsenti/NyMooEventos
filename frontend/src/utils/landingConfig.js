import { BRAND } from './brand'

// Datos comerciales de la landing pública -- EDITAR ACÁ para actualizar el
// número de WhatsApp, el Instagram y los packs en toda la página de una
// sola vez.
export const LANDING_CONTACT = {
  // Número oficial de WhatsApp de Nymoo (contacto corporativo).
  whatsappNumber: '5493412654649',
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

// Texto exacto pedido para las 4 cards -- transparente sobre la tasa
// financiera real, que varía según la cuenta de Mercado Pago de cada
// usuario, por eso no se promete "sin interés" acá.
const PAYMENT_NOTE = 'Se seña con el 50% | Hasta 3 cuotas con Mercado Pago'

export const LANDING_PACKS = [
  {
    id: 'invita',
    name: 'Nymoo INVITA',
    tagline: 'Plan inicial',
    price: '$50.000',
    // Debe coincidir con ITEM_PRICES en backend/controllers/orderController.js
    // -- se usa solo para mostrar el total en vivo mientras eligen productos;
    // el precio real que se cobra siempre lo recalcula el servidor.
    priceValue: 50000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.blue,
    whatsappMessage:
      '¡Hola, Nymoo! Me encantó el plan Nymoo INVITA ($50.000). Quisiera recibir asesoramiento para implementarlo en mi próxima celebración.',
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
    priceValue: 70000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.violet,
    badge: { emoji: '⭐', label: 'El más elegido', tone: 'brand' },
    includesFrom: 'Nymoo INVITA',
    whatsappMessage:
      '¡Hola, Nymoo! Estoy interesado en el plan destacado Nymoo CONECTA ($70.000). Me gustaría coordinar la seña para comenzar con el diseño.',
    features: [
      'Confirmación de asistencia (RSVP) por formulario en base de datos',
      'Acceso al panel de estadísticas de invitados en vivo',
      'Carrusel de fotos premium (novios o homenajeado)',
      'Fotos específicas del salón y la iglesia',
      'Álbum Digital Colaborativo con FOTOS ILIMITADAS',
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
    priceValue: 100000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.pink,
    badge: { emoji: '👑', label: 'La más completa', tone: 'gold' },
    includesFrom: 'Nymoo CONECTA',
    whatsappMessage:
      '¡Hola, Nymoo! Quiero la experiencia completa con el plan Premium Nymoo VIVE ($100.000). Me interesa saber más sobre las invitaciones VIP y la pantalla en vivo.',
    features: [
      'Confirmación de asistencia VIP con invitaciones personalizadas (pase individual con control estricto de cupos por familia/invitado)',
      'Panel de invitados VIP habilitado para personalizar los nombres desde las estadísticas en vivo',
      'Álbum Digital Colaborativo con FOTOS ILIMITADAS y hasta 80 videos cortos (máximo 15 segundos)',
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
    priceValue: 60000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.orange,
    banner: '¡Ideal si ya tenés tu invitación digital de otro proveedor y solo querés la pantalla en vivo para tu fiesta!',
    whatsappMessage:
      '¡Hola, Nymoo! Ya tengo mi invitación pero quiero contratar el pack Nymoo VISIÓN ($60.000) para tener la pantalla en vivo y la galería por QR en mi fiesta.',
    features: [
      'Pack exclusivo de álbum por QR colaborativo para subir fotos y videos cortos',
      'Álbum Digital Colaborativo con FOTOS ILIMITADAS y hasta 80 videos de 15 segundos',
      'Proyección multimedia en tiempo real en la pantalla del salón',
      'Panel de moderación avanzado para el cliente (control manual, automático o semiautomático)',
      'Interruptor en tiempo real para activar el Modo Fiesta',
      'Libro de firmas digital descargable (recopilación de dedicatorias de los invitados al subir sus archivos)',
      'Álbum multimedia descargable de forma directa desde el panel de moderación',
      'Soporte prioritario el día del evento',
    ],
  },
]

// Complementos vendibles solos o combinados con un pack -- a diferencia de
// LANDING_PACKS, no arman una invitación nueva (no necesitan diseño de
// tarjeta), así que en el checkout ocultan las secciones de estética (ver
// OrderForm.jsx / Checkout.jsx). Mismo shape que LANDING_PACKS para poder
// reusar PackPicker.jsx con cualquiera de los dos arrays.
export const LANDING_TOOLS = [
  {
    id: 'mesas',
    // Nombre comercial "Nymoo ORGANIZA" -- ORGANIZA en mayúsculas a
    // propósito, mismo patrón que INVITA/CONECTA/VIVE/VISIÓN. Debe coincidir
    // EXACTO con la key en ITEM_PRICES de
    // backend/controllers/orderController.js. El tagline es la aclaración
    // chica de qué es (se muestra arriba del nombre en la card, ver
    // ToolsSection.jsx).
    name: 'Nymoo ORGANIZA',
    tagline: 'Organizador de mesas',
    price: '$30.000',
    priceValue: 30000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.lime,
    badge: { emoji: '⚡', label: 'Entrega inmediata', tone: 'gold' },
    preview: 'tables',
    whatsappMessage:
      '¡Hola, Nymoo! Quiero contratar Nymoo ORGANIZA ($30.000) para armar la distribución de mesas de mi evento.',
    features: [
      'Importación masiva de invitados desde Excel en 1 segundo',
      'Control de capacidad estricto por mesa, con barra de ocupación por colores',
      'Estadísticas en vivo: invitados asignados, pendientes y mesas completas',
      'Cuadrícula interactiva visual de la distribución de mesas',
      'Descarga del reporte final ordenado, listo para imprimir y entregar en el salón',
    ],
  },
  {
    id: 'playlist',
    // "Nymoo RITMO" -- mismo patrón que ORGANIZA: debe coincidir EXACTO con
    // la key en ITEM_PRICES de backend/controllers/orderController.js.
    name: 'Nymoo RITMO',
    tagline: 'Planificador de playlist y cronograma musical',
    price: '$30.000',
    priceValue: 30000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.violet,
    badge: { emoji: '⚡', label: 'Entrega inmediata', tone: 'gold' },
    preview: 'playlist',
    whatsappMessage:
      '¡Hola, Nymoo! Quiero contratar Nymoo RITMO ($30.000) para armar el cronograma musical de mi evento.',
    features: [
      'Importación masiva de canciones desde Excel (título, artista y notas), incluso exportando tu playlist de Spotify',
      'Bloques por momento del evento: Recepción, Cena, Hora Loca, Cierre y más',
      'Reproductor de Spotify embebido en cada bloque para escuchar la selección sin salir de la app',
      'Asignación rápida de temas del banco general a cada tanda',
      'Notas personalizadas por canción para instrucciones específicas al DJ',
      'Descarga del cronograma final ordenado, listo para imprimir y entregar al DJ',
    ],
  },
  {
    id: 'agenda',
    // "Nymoo AGENDA" -- mismo patrón que ORGANIZA/RITMO: debe coincidir
    // EXACTO con la key en ITEM_PRICES de backend/controllers/orderController.js.
    name: 'Nymoo AGENDA',
    tagline: 'Agenda inteligente con recordatorios',
    price: '$30.000',
    priceValue: 30000,
    paymentNote: PAYMENT_NOTE,
    accentColor: BRAND.orange,
    badge: { emoji: '⚡', label: 'Entrega inmediata', tone: 'gold' },
    preview: 'agenda',
    whatsappMessage:
      '¡Hola, Nymoo! Quiero contratar Nymoo AGENDA ($30.000) para organizar las tareas y pendientes de mi evento.',
    features: [
      'Calendario visual con todas las tareas y vencimientos del evento',
      'Categorías por tipo de pendiente: citas, pagos, proveedores y más',
      'Recordatorios automáticos por WhatsApp en la fecha y hora que elijas',
      'Lista organizada por urgencia: atrasadas, para hoy, esta semana',
      'Ideal para no perderte ninguna prueba, pago ni reunión antes del evento',
    ],
  },
]

// IDs que identifican a un "complemento" (no arma invitación nueva) en vez
// de a un pack -- usado en Checkout.jsx para decidir si el pedido es
// "solo herramientas" y ocultar los campos de diseño del formulario.
export const LANDING_TOOL_IDS = LANDING_TOOLS.map((tool) => tool.id)

// Invitación Dúo: clon de la invitación con datos propios (ver
// isDuo/duoOf en backend/models/Event.js), promocionada en la landing
// (ver DUO_INFO en components/landing/faqData.js) con 50% off sobre el
// pack principal contratado. VISIÓN queda afuera a propósito, no es un
// pack de invitación de pareja/festejo. Estas constantes deben coincidir
// EXACTO con DUO_ADDON_NAME/DUO_ELIGIBLE_PACKS/DUO_DISCOUNT en
// backend/controllers/orderController.js -- el precio real siempre lo
// recalcula el servidor, esto es solo para mostrar el total en vivo.
export const DUO_ADDON_NAME = 'Invitación Dúo (50%)'
export const DUO_ELIGIBLE_PACK_IDS = ['invita', 'conecta', 'vive']
export const DUO_DISCOUNT = 0.5

// Dado un array de packs ya seleccionados (objetos de LANDING_PACKS), calcula
// el precio del add-on Dúo: 50% del pack elegible más caro entre los
// seleccionados. Devuelve 0 si ninguno de los seleccionados habilita el Dúo.
export function computeDuoAddonPrice(selectedPacks) {
  const eligiblePrices = selectedPacks.filter((p) => DUO_ELIGIBLE_PACK_IDS.includes(p.id)).map((p) => p.priceValue)
  if (eligiblePrices.length === 0) return 0
  return Math.round(Math.max(...eligiblePrices) * DUO_DISCOUNT)
}

// Motor de descuentos por combo de herramientas (ver ComboPromoBanner.jsx) --
// mismo trío de packs elegibles que el Dúo. Debe coincidir EXACTO con
// toolsDiscountRate/TOOL_BASE_PRICE en backend/controllers/orderController.js;
// acá es solo para el desglose en vivo del checkout, el precio real que se
// cobra siempre lo recalcula el servidor.
const TOOL_BASE_PRICE = 30000

// Tasa de descuento sobre el precio base de CADA herramienta, según cuántas
// se compren juntas y si el pedido incluye algún pack de invitación:
//   Con pack:  1 herramienta = 10% | 2 = 20% | 3 = 30%
//   Sin pack:  1 herramienta = 0%  | 2 = 10% | 3 = 20%
function toolsDiscountRate(toolCount, hasPack) {
  if (toolCount <= 0) return 0
  const tiers = hasPack ? [0, 0.1, 0.2, 0.3] : [0, 0, 0.1, 0.2]
  return tiers[Math.min(toolCount, tiers.length - 1)]
}

// Desglose de precio de las herramientas seleccionadas: subtotal a precio de
// lista, descuento en pesos, y total final -- para mostrar en el recibo del
// checkout (ver PriceBreakdown en Checkout.jsx).
export function computeToolsPricing(selectedPacks, selectedTools) {
  const hasPack = selectedPacks.some((p) => DUO_ELIGIBLE_PACK_IDS.includes(p.id))
  const toolCount = selectedTools.length
  const discountRate = toolsDiscountRate(toolCount, hasPack)
  const discountedUnitPrice = Math.round(TOOL_BASE_PRICE * (1 - discountRate))

  const toolsSubtotal = TOOL_BASE_PRICE * toolCount
  const toolsTotal = discountedUnitPrice * toolCount
  const toolsDiscount = toolsSubtotal - toolsTotal

  return { toolsSubtotal, toolsDiscount, toolsTotal, discountRate, hasPack }
}
