// Entrada estándar para las tarjetas de contenido de una sección al hacer scroll
// (fade + subida + leve escalado). Se usa spreadeada: <motion.div {...CARD_REVEAL}>
export const CARD_REVEAL = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' },
}
