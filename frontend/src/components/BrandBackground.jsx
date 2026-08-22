import { motion } from 'motion/react'
import { BRAND } from '../utils/brand'

// Fondo ambiental de marca para pantallas sin un evento específico detrás
// (login, listado de eventos): manchas de color de marca flotando despacio
// sobre el azul noche, mismo lenguaje visual que el resto de la plataforma.
function BrandBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: BRAND.night }}>
      <motion.div
        className="absolute w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30"
        style={{ background: BRAND.blue, top: '-12%', left: '-12%' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[30rem] h-[30rem] rounded-full blur-3xl opacity-25"
        style={{ background: BRAND.violet, bottom: '-14%', right: '-8%' }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[24rem] h-[24rem] rounded-full blur-3xl opacity-20"
        style={{ background: BRAND.pink, top: '32%', right: '12%' }}
        animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default BrandBackground
