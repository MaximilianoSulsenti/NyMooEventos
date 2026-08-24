import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { BRAND } from '../../utils/brand'

const HOLD_MS = 1600

// Intro de marca: aparece cada vez que se entra o se recarga la landing (no
// se guarda en localStorage a propósito -- el pedido fue que se vea siempre,
// no solo la primera vez). Se sostiene un instante con el mensaje y el
// ícono de los ojitos, y después se abre como un telón de teatro (dos
// paneles que se separan desde el centro) revelando la landing de atrás.
function WelcomeIntro() {
  const [stage, setStage] = useState('hold') // hold -> curtain -> done
  const reduceMotion = useReducedMotion()

  useLockBodyScroll()

  useEffect(() => {
    const timer = setTimeout(() => setStage('curtain'), reduceMotion ? 600 : HOLD_MS)
    return () => clearTimeout(timer)
  }, [reduceMotion])

  if (stage === 'done') return null

  const panelTransition = reduceMotion ? { duration: 0.01 } : { duration: 0.9, ease: [0.65, 0, 0.35, 1] }
  const opening = stage === 'curtain'

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="presentation">
      {/* Mensaje + ojitos, se desvanecen apenas arranca el telón */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 pointer-events-none px-6"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.92 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <motion.img
          src="/img/ojosnymoo-icon.png"
          alt="Nymoo"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: [0.6, 1.1, 0.95, 1],
            scaleY: reduceMotion ? 1 : [1, 1, 1, 0.08, 1, 1],
          }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeOut' },
            scale: { duration: 0.9, ease: 'easeOut' },
            scaleY: { duration: 1.5, times: [0, 0.55, 0.62, 0.68, 0.74, 1], ease: 'easeInOut' },
          }}
        />
        <motion.p
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          Bienvenidos a Nymoo
        </motion.p>
      </motion.div>

      {/* Telón: dos paneles que se abren desde el centro hacia los costados */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: `linear-gradient(135deg, ${BRAND.night}, #08080f)` }}
        animate={{ x: opening ? '-100%' : '0%' }}
        transition={panelTransition}
        onAnimationComplete={() => opening && setStage('done')}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: `linear-gradient(225deg, ${BRAND.night}, #08080f)` }}
        animate={{ x: opening ? '100%' : '0%' }}
        transition={panelTransition}
      />
    </div>
  )
}

export default WelcomeIntro
