export const SECTION_LABELS = {
  Hero: 'Portada',
  Countdown: 'Cuenta regresiva',
  EventDetail: 'Detalles del evento',
  Story: 'Nuestra historia',
  Gallery: 'Galería',
  Location: 'Ubicación',
  RSVP: 'Confirmación de asistencia',
  SalonCarrousel: 'Carrusel del salón',
  Info: 'Información adicional',
  MusicPlaylist: 'Playlist musical',
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

export const COUNTDOWN_SHAPE_OPTIONS = [
  { value: 'square', label: 'Cuadrado minimalista' },
  { value: 'circle', label: 'Círculo elegante' },
  { value: 'none', label: 'Sin bordes' },
]

export const GALLERY_LAYOUT_OPTIONS = [
  { value: 'bento', label: 'Bento grid' },
  { value: 'carousel', label: 'Carrusel 3D' },
]

export const STORY_LAYOUT_OPTIONS = [
  { value: 'vertical', label: 'Línea de tiempo vertical' },
  { value: 'horizontal', label: 'Línea de tiempo horizontal' },
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
    key: 'bgOpacity',
    label: 'Opacidad de la imagen',
    type: 'range',
    min: 0,
    max: 100,
    step: 5,
    showIf: (config) => config.bgType === 'imagen',
  },
]

export const SECTION_FIELD_DEFS = {
  Hero: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño del subtítulo', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Countdown: [
    { key: 'shape', label: 'Forma de los contadores', type: 'select', options: COUNTDOWN_SHAPE_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño de los dígitos', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeSubtitle', label: 'Tamaño de las etiquetas', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  EventDetail: [
    { key: 'description', label: 'Descripción', type: 'textarea' },
    { key: 'fontSizeBody', label: 'Tamaño del texto', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'alignment', label: 'Alineación', type: 'select', options: ALIGNMENT_OPTIONS },
  ],
  Story: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'body', label: 'Introducción', type: 'textarea' },
    {
      key: 'milestones',
      label: 'Hitos (uno por línea: "Fecha - Anécdota")',
      type: 'textarea',
    },
    { key: 'layout', label: 'Diseño', type: 'select', options: STORY_LAYOUT_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'fontSizeBody', label: 'Tamaño del texto', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Gallery: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'layout', label: 'Diseño', type: 'select', options: GALLERY_LAYOUT_OPTIONS },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Location: [
    {
      key: 'locations',
      label: 'Locaciones (una por línea: "Etiqueta | Dirección | Link de Maps")',
      type: 'textarea',
    },
    { key: 'fontSizeTitle', label: 'Tamaño de los títulos', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  RSVP: [{ key: 'title', label: 'Título', type: 'text' }],
  SalonCarrousel: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'caption', label: 'Pie de foto', type: 'text' },
    { key: 'image1', label: 'Imagen 1', type: 'image' },
    { key: 'image2', label: 'Imagen 2', type: 'image' },
    { key: 'image3', label: 'Imagen 3', type: 'image' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
    { key: 'transitionSpeed', label: 'Velocidad de transición (segundos)', type: 'range', min: 2, max: 10, step: 1 },
  ],
  Info: [
    {
      key: 'items',
      label: 'Bloques (uno por línea: "Título | Texto")',
      type: 'textarea',
    },
    { key: 'fontSizeTitle', label: 'Tamaño de los títulos', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  MusicPlaylist: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'spotifyUrl', label: 'Link de playlist (Spotify)', type: 'text' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Timeline: [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'items', label: 'Cronograma (una línea por ítem: "20:00 - Ceremonia")', type: 'textarea' },
    { key: 'fontSizeTitle', label: 'Tamaño del título', type: 'select', options: FONT_SIZE_OPTIONS },
  ],
  Footer: [
    { key: 'text', label: 'Frase de cierre', type: 'text' },
    { key: 'signature', label: 'Firma', type: 'text' },
    {
      key: 'socialLinks',
      label: 'Redes sociales (una por línea: "Instagram | https://instagram.com/...")',
      type: 'textarea',
    },
  ],
}
