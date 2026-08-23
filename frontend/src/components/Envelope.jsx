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

function Envelope({ settings, appearance, onOpen }) {
  const [opening, setOpening] = useState(false)
  const fontClass = FONT_FAMILY_CLASSES[settings.fontFamily] || 'font-sans'
  const bgColor = settings.bgColor || '#0a0a0a'
  const flapShade = shadeColor(bgColor, 14)
  const wallShade = shadeColor(bgColor, -12)
  const backdrop = shadeColor(bgColor, -25)

  function handleOpen() {
    setOpening(true)
    setTimeout(onOpen, 1100)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: backdrop, pointerEvents: opening ? 'none' : 'auto' }}
      initial={false}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: 0.5, delay: opening ? 0.6 : 0 }}
    >
      {/* Todo el efecto de sobre (paredes + solapa) queda contenido en una
          tarjeta de proporciones fijas -- si el clip-path se calculara
          contra el viewport completo, en un celular angosto y alto los
          triángulos quedan bien distorsionados en vez de simétricos. El
          fade final vive en el contenedor de arriba (así el fondo detrás
          de la tarjeta desaparece junto con ella, sin dejar un marco de
          color); acá solo un leve achique para acompañar. */}
      <motion.div
        className="relative w-full max-w-sm aspect-[4/5] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        initial={false}
        animate={{ scale: opening ? 0.97 : 1 }}
        transition={{ duration: 0.4, delay: opening ? 0.6 : 0 }}
      >
        {/* Papel base del sobre: cubre toda la tarjeta, se desvanece al final revelando la invitación */}
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: bgColor }}
          animate={opening ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: opening ? 0.55 : 0 }}
        >
          <EnvelopeBackground settings={settings} />
        </motion.div>

        {/* Pared izquierda */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
            background: `linear-gradient(90deg, ${wallShade}, ${bgColor})`,
          }}
          animate={opening ? { x: '-100%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Pared derecha */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)',
            background: `linear-gradient(270deg, ${wallShade}, ${bgColor})`,
          }}
          animate={opening ? { x: '100%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Solapa superior */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
            background: `linear-gradient(180deg, ${flapShade}, ${bgColor})`,
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.12)',
          }}
          animate={opening ? { y: '-100%', opacity: 0 } : { y: '0%', opacity: 1 }}
          transition={{ duration: 0.55, ease: 'easeInOut', delay: opening ? 0.15 : 0 }}
        />

        {/* Contenido: texto de bienvenida y botón */}
        <motion.div
          className={cn(
            'absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6',
            fontClass
          )}
          animate={opening ? { opacity: 0, y: -24 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {settings.titleText && (
            <p className="text-white text-xl sm:text-2xl mb-8 leading-relaxed">{settings.titleText}</p>
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
      </motion.div>
    </motion.div>
  )
}

export default Envelope
