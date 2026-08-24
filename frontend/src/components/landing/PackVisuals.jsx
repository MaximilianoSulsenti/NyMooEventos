import { motion } from 'motion/react'
import { BRAND } from '../../utils/brand'

// Un componente visual chico y en loop por card, en vez de una imagen
// estática -- todo con CSS/motion (mismo criterio liviano que el sobre 3D
// de la tarjeta digital: nada de Three.js/imágenes pesadas para un detalle
// decorativo).

// INVITA -- un sobre que se abre despacio en bucle, la carta se asoma.
function InvitaVisual({ color }) {
  return (
    <div className="relative w-20 h-14" style={{ perspective: 240 }}>
      <div
        className="absolute inset-x-1 bottom-0 h-10 rounded-md"
        style={{ background: `${color}26`, border: `1px solid ${color}55` }}
      />
      <motion.div
        className="absolute left-1/2 top-1 -translate-x-1/2 w-11 h-8 rounded-sm bg-white/90 shadow-md"
        animate={{ y: [6, -8, 6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-x-1 top-0 h-6 origin-top"
        style={{
          background: `linear-gradient(160deg, ${color}, ${color}40)`,
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateX: [0, -140, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// CONECTA -- mini dashboard con barras que suben, simulando confirmaciones
// en vivo, más un destello ("nueva confirmación").
function ConectaVisual({ color }) {
  const bars = [0.45, 0.7, 0.55, 0.85, 0.65]
  return (
    <div className="relative w-full h-full flex items-end justify-center gap-1.5 px-6 pb-3">
      {bars.map((peak, i) => (
        <motion.div
          key={i}
          className="w-2.5 rounded-t-sm"
          style={{ background: color }}
          animate={{ height: [`${peak * 35}%`, `${peak * 100}%`, `${peak * 60}%`, `${peak * 100}%`] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
      <motion.div
        className="absolute top-3 right-5 w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px 3px ${color}` }}
        animate={{ opacity: [0, 1, 0], scale: [0.6, 1.5, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// VIVE -- fotos flotando en capas (glass) + un haz de proyector pulsando
// detrás, con desenfoque de fondo.
function ViveVisual({ color }) {
  const photos = [
    { left: '18%', top: '18%', rotate: -8, duration: 4.2, delay: 0 },
    { left: '46%', top: '32%', rotate: 6, duration: 4.8, delay: 0.35 },
    { left: '66%', top: '12%', rotate: -3, duration: 3.8, delay: 0.7 },
  ]
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-14"
        style={{
          background: `conic-gradient(from 200deg at 50% 100%, transparent, ${color}70, transparent 40%)`,
          filter: 'blur(8px)',
        }}
        animate={{ opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {photos.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-9 h-7 rounded-md bg-white/15 border border-white/25 backdrop-blur-md"
          style={{ left: p.left, top: p.top, rotate: `${p.rotate}deg` }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}

// VISIÓN -- lente de cámara / marco de pantalla con borde en pulso de
// colores neón, tipo "Modo Fiesta".
const NEON_CYCLE = [BRAND.blue, BRAND.pink, BRAND.lime, BRAND.violet, BRAND.blue]

function VisionVisual() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ border: '2px solid transparent' }}
        animate={{ borderColor: NEON_CYCLE, boxShadow: NEON_CYCLE.map((c) => `0 0 16px 1px ${c}90`) }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="w-7 h-7 rounded-full border-2 border-white/60 flex items-center justify-center"
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
      </motion.div>
    </div>
  )
}

export const PACK_VISUALS = {
  invita: InvitaVisual,
  conecta: ConectaVisual,
  vive: ViveVisual,
  vision: VisionVisual,
}
