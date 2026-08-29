import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { BRAND } from '../../utils/brand'

// Anuncia la política de descuentos por combo justo arriba de las cards de
// herramientas -- el momento en que alguien está mirando precios es donde
// más rinde este mensaje, por eso va acá y no en el AnnounceBar de arriba
// de todo (que ya tiene su propio mensaje fijo sobre el plazo de entrega).
function ComboPromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl p-px max-w-4xl mx-auto mb-10"
      style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.pink}, ${BRAND.violet})` }}
    >
      <div className="rounded-[calc(1rem-1px)] bg-neutral-950/90 backdrop-blur-xl px-5 py-4 sm:px-7 sm:py-5 flex items-center gap-4">
        <motion.span
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${BRAND.orange}22` }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame className="w-5 h-5" style={{ color: BRAND.orange }} />
        </motion.span>
        <p className="text-sm sm:text-[15px] text-white/85 leading-snug">
          <span className="font-bold text-white">¡Armá tu combo y ahorrá con descuentos acumulativos!</span>{' '}
          Si contratás cualquier Pack de Invitación, cada herramienta extra suma descuento
          <span className="font-semibold" style={{ color: BRAND.orange }}>
            {' '}
            (¡hasta 30% OFF en la suite completa!)
          </span>
          . Si comprás solo las herramientas:{' '}
          <span className="font-semibold" style={{ color: BRAND.lime }}>
            10% OFF llevando dos
          </span>{' '}
          y{' '}
          <span className="font-semibold" style={{ color: BRAND.lime }}>
            20% OFF llevando las tres
          </span>
          .
        </p>
      </div>
    </motion.div>
  )
}

export default ComboPromoBanner
