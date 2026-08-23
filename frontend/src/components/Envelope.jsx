import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { shadeColor } from '../utils/color'
import { FONT_FAMILY_CLASSES } from '../sections/theming'

function EnvelopeBackground({ settings }) {
  if (settings.bgType === 'image' && settings.bgUrl) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${settings.bgUrl})`, opacity: (settings.bgOpacity ?? 100) / 100 }}
      />
    )
  }
  if (settings.bgType === 'video' && settings.bgUrl) {
    return (
      <video
        src={settings.bgUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: (settings.bgOpacity ?? 100) / 100 }}
      />
    )
  }
  return null
}

// Alto de la solapa como % de la tarjeta -- todo el recorte en punta
// (clip-path) se calcula relativo a la solapa misma, no al viewport, así
// nunca vuelve a distorsionarse en pantallas angostas y altas.
const FLAP_HEIGHT_PERCENT = 54
const FLAP_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 74%, 50% 100%, 0 74%)'
// Punta de la solapa en coordenadas relativas a toda la tarjeta (no a la
// solapa) -- ahí es donde se apoyan las costuras y el sello de cera.
const FLAP_TIP_Y = FLAP_HEIGHT_PERCENT

function Envelope({ settings, appearance, onOpen }) {
  const [opening, setOpening] = useState(false)
  const fontClass = FONT_FAMILY_CLASSES[settings.fontFamily] || 'font-sans'
  const bgColor = settings.bgColor || '#0a0a0a'
  const flapFrontShade = shadeColor(bgColor, 18)
  const flapBackShade = shadeColor(bgColor, -35)
  const backdrop = shadeColor(bgColor, -25)

  function handleOpen() {
    setOpening(true)
    setTimeout(onOpen, 1200)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: backdrop, pointerEvents: opening ? 'none' : 'auto' }}
      initial={false}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: 0.5, delay: opening ? 0.7 : 0 }}
    >
      {/* La tarjeta tiene proporciones fijas (no el viewport crudo), así el
          efecto se ve simétrico en cualquier celular. perspective acá arriba
          es lo que le da profundidad real al giro de la solapa de abajo. */}
      <motion.div
        className="relative w-full max-w-sm aspect-[4/5] max-h-[85vh] rounded-2xl shadow-2xl"
        style={{ perspective: 1400 }}
        initial={false}
        animate={{ scale: opening ? 0.96 : 1 }}
        transition={{ duration: 0.45, delay: opening ? 0.7 : 0 }}
      >
        {/* Cuerpo del sobre: fondo (color/imagen/video) + las costuras de
            las solapas laterales/inferior (como un sobre real) + el
            mensaje de bienvenida centrado en el bolsillo, debajo de la
            solapa. */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
          style={{ backgroundColor: bgColor }}
        >
          <EnvelopeBackground settings={settings} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {/* Costuras del bolsillo: las líneas de las solapas laterales que
              se doblan por detrás, como en un sobre de papel real -- se
              calculan en % así quedan perfectas sin importar el tamaño de
              pantalla. */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="100" x2="50" y2={FLAP_TIP_Y} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>

          <motion.div
            className={cn('absolute inset-x-0 z-10 flex flex-col items-center justify-center text-center px-6', fontClass)}
            style={{ top: `${FLAP_TIP_Y}%`, bottom: 0 }}
            animate={{ opacity: opening ? 0 : 1, y: opening ? 10 : 0 }}
            transition={{ duration: 0.3, delay: opening ? 0 : 0.2 }}
          >
            {settings.titleText && (
              <p className="text-white text-xl sm:text-2xl mb-6 leading-relaxed drop-shadow-lg">
                {settings.titleText}
              </p>
            )}

            <motion.button
              type="button"
              onClick={handleOpen}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-medium tracking-wide shadow-2xl border border-white/10"
              style={{ background: appearance.primaryColor, color: '#0a0a0a' }}
            >
              {settings.buttonText || 'Abrir invitación'}
            </motion.button>
          </motion.div>
        </div>

        {/* Sello de cera sobre la punta de la solapa -- se "rompe" (achica
            y se desvanece) apenas se toca el botón. */}
        <motion.div
          className="absolute z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"
          style={{
            left: '50%',
            top: `${FLAP_TIP_Y}%`,
            background: `radial-gradient(circle at 35% 30%, ${shadeColor(appearance.primaryColor, 25)}, ${appearance.primaryColor} 60%, ${shadeColor(appearance.primaryColor, -25)})`,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.35), 0 4px 10px -2px rgba(0,0,0,0.5)',
          }}
          animate={opening ? { scale: 0, opacity: 0, rotate: 25 } : { scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.35, ease: 'easeIn' }}
        >
          <div className="absolute inset-1.5 rounded-full border border-white/25" />
        </motion.div>

        {/* Sombra que se profundiza a medida que la solapa se levanta, para
            que el papel de abajo se sienta "adentro" del sobre en vez de
            plano. */}
        <motion.div
          className="absolute inset-x-0 top-0 pointer-events-none rounded-t-2xl"
          style={{ height: `${FLAP_HEIGHT_PERCENT}%`, background: 'radial-gradient(ellipse at top, rgba(0,0,0,0.4), transparent 70%)' }}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: 0.5, delay: opening ? 0.1 : 0 }}
        />

        {/* Solapa: bisagra real en 3D (rotateX), no un slide -- se pliega
            hacia atrás como una solapa de papel de verdad. */}
        <motion.div
          className="absolute inset-x-0 top-0 origin-top"
          style={{ height: `${FLAP_HEIGHT_PERCENT}%`, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: opening ? -170 : 0 }}
          transition={{ duration: 0.7, ease: [0.45, 0, 0.2, 1] }}
        >
          {/* Cara frontal (lo que se ve mientras está cerrada) */}
          <div
            className="absolute inset-0 rounded-t-2xl"
            style={{
              clipPath: FLAP_CLIP_PATH,
              backfaceVisibility: 'hidden',
              background: `linear-gradient(160deg, ${flapFrontShade}, ${bgColor})`,
              boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.15)',
            }}
          />
          {/* Cara trasera (lo que se ve cuando termina de girar hacia atrás) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: FLAP_CLIP_PATH,
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: `linear-gradient(160deg, ${flapBackShade}, ${bgColor})`,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Envelope
