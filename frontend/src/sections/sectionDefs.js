export const SECTION_LABELS = {
  Hero: 'Portada',
  Countdown: 'Cuenta regresiva',
  EventDetail: 'Detalles del evento',
  Story: 'Nuestra historia',
  Gallery: 'Galería de los novios',
  LiveGallery: 'Galería en vivo (QR)',
  DigitalAlbumButton: 'Álbum digital por QR',
  Location: 'Ubicación',
  RSVP: 'Confirmación de asistencia',
  GiftRegistry: 'Lista de regalos / Colecta',
  SalonCarrousel: 'Carrusel del salón',
  Info: 'Información adicional',
  MusicPlaylist: 'Playlist musical',
  InstagramSection: 'Instagram del evento',
  Timeline: 'Cronograma',
  Footer: 'Pie de página',
}

export const SECTION_IDS = Object.keys(SECTION_LABELS)

export const FONT_SIZE_OPTIONS = [
  { value: 'text-sm', label: 'Pequeño' },
  { value: 'text-base', label: 'Normal' },
  { value: 'text-lg', label: 'Mediano' },
  { value: 'text-2xl', label: 'Grande' },
  { value: 'text-3xl', label: 'Muy grande' },
  { value: 'text-5xl', label: 'Enorme' },
]

export const ALIGNMENT_OPTIONS = [
  { value: 'text-left', label: 'Izquierda' },
  { value: 'text-center', label: 'Centro' },
  { value: 'text-right', label: 'Derecha' },
]

export const GRADIENT_PRESETS = [
  { value: '', label: 'Sin degradado' },
  { value: 'from-purple-900/50 via-transparent to-black/70', label: 'Púrpura nocturno' },
  { value: 'from-pink-900/40 via-transparent to-black/70', label: 'Rosa romántico' },
  { value: 'from-amber-900/40 via-transparent to-black/70', label: 'Dorado cálido' },
  { value: 'from-slate-800/50 via-transparent to-black/80', label: 'Elegante oscuro' },
]

export const BG_TYPE_OPTIONS = [
  { value: 'color', label: 'Color sólido' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
]

export { EVENT_ICON_OPTIONS, EVENT_ICON_OPTIONS as INFO_ICON_OPTIONS } from './eventIcons'
import { EVENT_ICON_OPTIONS } from './eventIcons'

// Igual que EVENT_ICON_OPTIONS pero con una opción "Automático" primero, para
// campos donde el ícono se puede detectar solo por palabra clave si no se elige uno.
const AUTO_ICON_OPTIONS = [{ value: '', label: 'Automático (según el texto)' }, ...EVENT_ICON_OPTIONS]

export const COUNTDOWN_SHAPE_OPTIONS = [
  { value: 'square', label: 'Bordes ultra finos minimalistas' },
  { value: 'circle', label: 'Círculo elegante' },
  { value: 'glass', label: 'Vidrio esmerilado (glassmorphism)' },
  { value: 'solid', label: 'Tarjeta sólida con sombra profunda' },
  { value: 'none', label: 'Sin contenedor' },
]

export const GALLERY_LAYOUT_OPTIONS = [
  { value: 'bento', label: 'Grid animado (Bento)' },
  { value: 'carousel', label: 'Carrusel clásico' },
  { value: 'carousel3d', label: 'Carrusel 3D premium' },
]

export const STORY_LAYOUT_OPTIONS = [
  { value: 'vertical', label: 'Línea de tiempo vertical' },
  { value: 'horizontal', label: 'Línea de tiempo horizontal' },
]

export const DETAIL_GROUP_LAYOUT_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal (tarjetas en fila, ej. Fecha / Hora / Lugar)' },
  { value: 'vertical', label: 'Vertical (lista, un ítem debajo del otro)' },
]

// El sistema de campos no tiene un tipo "checkbox" propio -- un select
// Sí/No hace lo mismo sin sumar un tipo de campo nuevo a FieldInput. El
// value vacío ('') es el "No"/apagado, así una invitación vieja sin este
// campo cargado (undefined) también cae del lado de "apagado".
export const YES_NO_OPTIONS = [
  { value: '', label: 'No' },
  { value: 'si', label: 'Sí' },
]

// Campos comunes a toda sección (capas de fondo). Se editan aparte, en un bloque
// compartido, en vez de repetirse en SECTION_FIELD_DEFS.
export const BACKGROUND_FIELD_DEFS = [
  {
    key: 'bgType',
    label: 'Tipo de fondo',
    type: 'select',
    options: [
      { value: 'color', label: 'Color (usa el fondo general del tema)' },
      { value: 'imagen', label: 'Imagen' },
    ],
  },
  { key: 'bgImageUrl', label: 'Imagen de fondo', type: 'image', showIf: (config) => config.bgType === 'imagen' },
  {
    key: 'bgPosition',
    label: 'Encuadre de la imagen',
    type: 'select',
    showIf: (config) => config.bgType === 'imagen',
    options: [
      { value: 'center', label: 'Centro' },
      { value: 'top', label: 'Arriba' },
      { value: 'bottom', label: 'Abajo' },
      { value: 'left', label: 'Izquierda' },
      { value: 'right', label: 'Derecha' },
    ],
  },
  {
    key: 'bgOpacity',
    label: 'Opacidad de la imagen',
    type: 'range',
    min: 0,
    max: 100,
    step: 5,
    showIf: (config) => config.bgType === 'imagen',
  },
]

// Campo compartido para el color del texto de cada sección (por defecto
// blanco) -- afecta título, subtítulo, cuerpo y demás texto de esa sección
// (ver secondaryTextColor en utils/color.js), no solo el título.
export const TEXT_FIELD_DEFS = [{ key: 'textColor', label: 'Color del texto', type: 'color' }]

// Fondo vidriado (glassmorphism) editable, para las secciones con tarjetas de vidrio.
export const GLASS_FIELD_DEFS = [
  { key: 'glassOpacity', label: 'Opacidad del vidrio', type: 'range', min: 0, max: 20, step: 1 },
  {
    key: 'glassBlur',
    label: 'Desenfoque del vidrio',
    type: 'select',
    options: [
      { value: 'none', label: 'Ninguno' },
      { value: 'sm', label: 'Sutil' },
      { value: 'md', label: 'Medio' },
      { value: 'lg', label: 'Fuerte' },
    ],
  },
]

export const SECTIONS_WITH_GLASS_CARD = [
  'EventDetail',
  'Location',
  'Info',
  'MusicPlaylist',
  'RSVP',
  'GiftRegistry',
  'InstagramSection',
]

export const SECTION_FIELD_DEFS = {
  Hero: [
    { key: 'kicker', label: 'Frase chica arriba del título (ej. "Te invitamos a celebrar")', type: 'text' },
    {
      key: 'vipGreeting',
      label: 'Saludo VIP para invitados con link personalizado (usá {nombre} donde va su nombre)',
      type: 'text',
    },
    {
      key: 'showDate',
      label: '¿Mostrar la fecha y hora en la portada? (chica, junto al subtítulo -- no reemplaza a Detalle del evento ni Cuenta regresiva)',
      type: 'select',
      options: YES_NO_OPTIONS,
    },
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'dedication', label: 'Dedicatoria o lema (opcional)', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Countdown: [
    { key: 'title', label: 'Título de la sección', type: 'text' },
    { key: 'shape', label: 'Forma de los contadores', type: 'select', options: COUNTDOWN_SHAPE_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño de los dígitos', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño de las etiquetas', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  EventDetail: [
    { key: 'title', label: 'Título de la sección (opcional)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo de la sección (opcional)', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'description', label: 'Descripción', type: 'textarea' },
    {
      key: 'details',
      label: 'Detalles adicionales (ceremonia, código de vestimenta, etc.)',
      type: 'repeater',
      addLabel: 'Agregar detalle',
      itemFields: [
        { key: 'icon', label: 'Ícono', type: 'select', options: AUTO_ICON_OPTIONS },
        { key: 'label', label: 'Título (ej. Ceremonia religiosa)' },
        { key: 'text', label: 'Descripción (ej. Iglesia San José, 18:00 hs)' },
      ],
    },
    { key: 'fontSizeBody', label: 'Tamaño del texto', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'alignment', label: 'Alineación', type: 'select', options: ALIGNMENT_OPTIONS },
    {
      key: 'groups',
      label:
        'Grupos de detalles (opcional -- ej. "Ceremonia Religiosa" con Fecha/Hora/Lugar, "Fiesta en Salón" con los suyos). Si cargás uno o más, reemplazan el bloque de fecha simple de arriba.',
      type: 'repeater',
      addLabel: 'Agregar grupo',
      itemFields: [
        { key: 'title', label: 'Título del grupo (ej. Ceremonia Religiosa)' },
        { key: 'subtitle', label: 'Subtítulo del grupo (ej. Detalles del evento de iglesia)' },
        { key: 'layout', label: 'Diseño de los ítems', type: 'select', options: DETAIL_GROUP_LAYOUT_OPTIONS },
        {
          key: 'items',
          label: 'Ítems del grupo (ej. Fecha, Hora, Lugar)',
          type: 'repeater',
          addLabel: 'Agregar ítem',
          itemFields: [
            { key: 'icon', label: 'Ícono', type: 'select', options: AUTO_ICON_OPTIONS },
            { key: 'label', label: 'Etiqueta (ej. FECHA)' },
            { key: 'text', label: 'Valor (ej. 20 de Noviembre 2026)' },
          ],
        },
      ],
    },
  ],
  Story: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'body', label: 'Introducción', type: 'textarea' },
    {
      key: 'milestones',
      label: 'Hitos de la historia',
      type: 'repeater',
      addLabel: 'Agregar hito',
      itemFields: [
        { key: 'title', label: 'Título (ej. fecha o hito)' },
        { key: 'subtitle', label: 'Descripción corta' },
      ],
    },
    { key: 'layout', label: 'Diseño', type: 'select', options: STORY_LAYOUT_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeBody', label: 'Tamaño del texto', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Gallery: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'images', label: 'Fotos (sin límite)', type: 'imageList' },
    { key: 'layout', label: 'Diseño', type: 'select', options: GALLERY_LAYOUT_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  LiveGallery: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'description', label: 'Texto descriptivo (opcional, más largo)', type: 'textarea' },
    { key: 'buttonText', label: 'Texto del botón', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  DigitalAlbumButton: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'description', label: 'Texto descriptivo (opcional, más largo)', type: 'textarea' },
    { key: 'buttonText', label: 'Texto del botón', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Location: [
    { key: 'title', label: 'Título de la sección', type: 'text' },
    { key: 'mapsButtonText', label: 'Texto del botón del mapa', type: 'text' },
    {
      key: 'locations',
      label: 'Locaciones',
      type: 'repeater',
      addLabel: 'Agregar locación',
      itemFields: [
        { key: 'icon', label: 'Ícono', type: 'select', options: AUTO_ICON_OPTIONS },
        { key: 'label', label: 'Nombre (ej. Ceremonia, Fiesta)' },
        { key: 'address', label: 'Dirección' },
        { key: 'mapUrl', label: 'Link de Google Maps (botón Compartir → Copiar enlace, o el src del iframe de inserción)' },
        { key: 'fontSize', label: 'Tamaño de fuente', type: 'select', options: FONT_SIZE_OPTIONS },
      ],
    },
    { key: 'fontSizeTitle', label: 'Tamaño del título de la sección', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  RSVP: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'buttonTextWhatsapp', label: 'Texto del botón (si confirman por WhatsApp)', type: 'text' },
    { key: 'buttonTextForm', label: 'Texto del botón (si confirman por formulario propio)', type: 'text' },
    { key: 'priceButtonText', label: 'Texto del link "Ver valor de la tarjeta" (opcional)', type: 'text' },
    {
      key: 'dietaryOptions',
      label: 'Opciones de restricciones alimentarias (una por línea, ej. "Vegetariano")',
      type: 'textarea',
    },
    {
      key: 'extraQuestions',
      label: 'Preguntas adicionales para el invitado',
      type: 'repeater',
      addLabel: 'Agregar pregunta',
      itemFields: [{ key: 'label', label: 'Pregunta (ej. ¿Necesitás menú infantil?)' }],
    },
  ],
  GiftRegistry: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'buttonText', label: 'Texto del botón', type: 'text' },
    { key: 'holderName', label: 'Titular de la cuenta', type: 'text' },
    { key: 'cbuAlias', label: 'Alias / CBU', type: 'text' },
    { key: 'bankName', label: 'Banco (opcional)', type: 'text' },
    { key: 'customMessage', label: 'Mensaje de agradecimiento (dentro del modal)', type: 'textarea' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  SalonCarrousel: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'caption', label: 'Pie de foto', type: 'text' },
    { key: 'image1', label: 'Imagen 1', type: 'image' },
    { key: 'image2', label: 'Imagen 2', type: 'image' },
    { key: 'image3', label: 'Imagen 3', type: 'image' },
    { key: 'images', label: 'Fotos adicionales (opcional, para sumar más de 3 al carrusel)', type: 'imageList' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'transitionSpeed', label: 'Velocidad de transición (segundos)', type: 'range', min: 2, max: 10, step: 1 },
  ],
  Info: [
    { key: 'title', label: 'Título de la sección', type: 'text' },
    {
      key: 'items',
      label: 'Bloques de información',
      type: 'repeater',
      addLabel: 'Agregar bloque',
      itemFields: [
        {
          key: 'icon',
          label: 'Ícono',
          type: 'select',
          options: EVENT_ICON_OPTIONS,
        },
        { key: 'title', label: 'Título (ej. Código de vestimenta)' },
        { key: 'body', label: 'Texto' },
      ],
    },
    { key: 'fontSizeTitle', label: 'Tamaño de los títulos', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  MusicPlaylist: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'playlistUrl', label: 'Link de playlist (Spotify, YouTube o Apple Music)', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  InstagramSection: [
    { key: 'title', label: 'Título (opcional)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo (opcional)', type: 'text' },
    { key: 'buttonText', label: 'Texto del botón', type: 'text' },
    { key: 'instagramUrl', label: 'Link de Instagram (perfil o publicación del evento)', type: 'text' },
    { key: 'accentColor', label: 'Color de acento (vacío = degradado clásico de Instagram)', type: 'color' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Timeline: [
    { key: 'title', label: 'Título', type: 'text' },
    {
      key: 'items',
      label: 'Cronograma',
      type: 'repeater',
      addLabel: 'Agregar ítem',
      itemFields: [
        { key: 'time', label: 'Hora (ej. 20:00)' },
        { key: 'label', label: 'Actividad (ej. Ceremonia)' },
        { key: 'icon', label: 'Ícono', type: 'select', options: AUTO_ICON_OPTIONS },
      ],
    },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Footer: [
    { key: 'text', label: 'Frase de cierre', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del nombre del evento', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'signature', label: 'Firma', type: 'text' },
    {
      key: 'socialLinks',
      label: 'Redes sociales (una por línea: "Instagram | https://instagram.com/...")',
      type: 'textarea',
    },
  ],
}
