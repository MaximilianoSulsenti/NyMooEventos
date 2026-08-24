import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Camera, Projector, QrCode, Smartphone } from 'lucide-react'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { BRAND } from '../../utils/brand'

const HOLD_MS = 2600
const GRADIENT_IMAGE = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`

// Íconos flotantes alrededor del mensaje -- lo que se trata Nymoo, de un
// vistazo, antes de entrar a la landing. Posiciones en % para que se
// mantengan proporcionadas en cualquier tamaño de pantalla (el contenedor
// es fixed inset-0, o sea, siempre el viewport completo).
const FLOATING_ICONS = [
  { Icon: Camera, top: '20%', left: '13%', color: BRAND.blue, delay: 0.55 },
  { Icon: Projector, top: '72%', left: '17%', color: BRAND.violet, delay: 0.7 },
  { Icon: QrCode, top: '22%', left: '87%', color: BRAND.pink, delay: 0.85 },
  { Icon: Smartphone, top: '70%', left: '83%', color: BRAND.lime, delay: 1.0 },
]

// Mismas manchas de color flotando despacio que usa el Hero/BrandBackground
// -- para que el telón no se sienta como un fondo plano aparte, sino parte
// del mismo lenguaje visual del resto de la landing. Cada paño (izquierda/
// derecha) es su propio panel de 50vw que se desliza por separado, así que
// las manchas se reparten una a una en vez de compartir posiciones
// pensadas para la pantalla completa.
function AmbientBlobs({ side }) {
  const nearCenter = side === 'left' ? { right: '-18%' } : { left: '-18%' }
  const outerCorner = side === 'left' ? { top: '-10%', left: '-14%' } : { top: '-10%', right: '-14%' }

  return (
    <>
      <motion.div
        className="absolute w-[24rem] h-[24rem] rounded-full blur-3xl opacity-25"
        style={{ background: side === 'left' ? BRAND.blue : BRAND.violet, ...outerCorner }}
        animate={{ x: [0, side === 'left' ? 26 : -26, 0], y: [0, 20, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[18rem] h-[18rem] rounded-full blur-3xl opacity-20"
        style={{ background: BRAND.pink, bottom: '-8%', ...nearCenter }}
        animate={{ x: [0, side === 'left' ? -16 : 16, 0], y: [0, -14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

// Un brillo diagonal que recorre cada paño del telón despacio, como luz
// deslizándose sobre tela -- refuerza la idea de cortina de verdad en vez
// de dos rectángulos de color planos.
function CurtainSheen({ delay = 0 }) {
  return (
    <motion.div
      className="absolute -inset-y-16 w-1/2"
      style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.07), transparent)' }}
      animate={{ x: ['-140%', '260%'] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay, repeatDelay: 1.2 }}
    />
  )
}

// Intro de marca: aparece cada vez que se entra o se recarga la landing (no
// se guarda en localStorage a propósito -- el pedido fue que se vea siempre,
// no solo la primera vez). Se sostiene un instante con el mensaje, el ícono
// de los ojitos y algunos íconos de lo que ofrece Nymoo flotando alrededor,
// y después se abre como un telón de teatro (dos paneles que se separan
// desde el centro) revelando la landing de atrás.
function WelcomeIntro() {
  const [stage, setStage] = useState('hold') // hold -> curtain -> done
  const reduceMotion = useReducedMotion()

  useLockBodyScroll()

  useEffect(() => {
    const timer = setTimeout(() => setStage('curtain'), reduceMotion ? 700 : HOLD_MS)
    return () => clearTimeout(timer)
  }, [reduceMotion])

  if (stage === 'done') return null

  const panelTransition = reduceMotion ? { duration: 0.01 } : { duration: 0.9, ease: [0.65, 0, 0.35, 1] }
  const opening = stage === 'curtain'

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="presentation">
      {/* Mensaje + ojitos + íconos flotantes, se desvanecen apenas arranca el telón */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.92 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {FLOATING_ICONS.map(({ Icon, top, left, color, delay }, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ top, left, background: `${color}22`, border: `1px solid ${color}45` }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -8, 0], rotate: [0, -6, 4, 0] }
            }
            transition={
              reduceMotion
                ? { delay, duration: 0.4 }
                : {
                    opacity: { delay, duration: 0.4 },
                    scale: { delay, duration: 0.4 },
                    y: { delay: delay + 0.4, duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { delay: delay + 0.4, duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
                  }
            }
          >
            <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color }} />
          </motion.div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
          <div className="relative">
            {!reduceMotion && (
              <motion.span
                className="absolute inset-0 rounded-3xl"
                style={{ background: BRAND.blue }}
                animate={{ scale: [1, 1.55, 1.55], opacity: [0.35, 0, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.9 }}
              />
            )}
            <motion.img
              src="/img/ojosnymoo-icon.png"
              alt="Nymoo"
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl shadow-2xl"
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
          </div>
          <motion.p
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
            style={{
              backgroundImage: GRADIENT_IMAGE,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: reduceMotion ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              opacity: { delay: 0.35, duration: 0.5, ease: 'easeOut' },
              y: { delay: 0.35, duration: 0.5, ease: 'easeOut' },
              backgroundPosition: { delay: 0.7, duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            Bienvenidos a Nymoo
          </motion.p>
        </div>
      </motion.div>

      {/* Telón: dos paneles que se abren desde el centro hacia los costados,
          cada uno con manchas de color ambientales y un brillo que lo
          recorre, en vez de un color plano sin vida. */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND.night}, #08080f)` }}
        animate={{ x: opening ? '-100%' : '0%' }}
        transition={panelTransition}
        onAnimationComplete={() => opening && setStage('done')}
      >
        {!reduceMotion && (
          <>
            <AmbientBlobs side="left" />
            <CurtainSheen delay={0.4} />
          </>
        )}
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
        style={{ background: `linear-gradient(225deg, ${BRAND.night}, #08080f)` }}
        animate={{ x: opening ? '100%' : '0%' }}
        transition={panelTransition}
      >
        {!reduceMotion && (
          <>
            <AmbientBlobs side="right" />
            <CurtainSheen delay={1.6} />
          </>
        )}
      </motion.div>
    </div>
  )
}

export default WelcomeIntro
