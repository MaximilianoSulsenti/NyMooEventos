import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { getContrastTextColor, extractDominantColor, extractDominantColorFromVideo } from '../utils/color'
import { FONT_FAMILY_CLASSES } from '../sections/theming'
import GlobalBackground from '../sections/GlobalBackground'
import Button from './ui/Button'

// Un fondo "completo" (a pantalla completa) que después se recorta en 4
// cuadrantes -- cada cuadrante es un simple overflow:hidden del tamaño de
// su cuarto de pantalla, con ESTE contenido de adentro escalado a 100vw x
// 100vh y corrido con un offset negativo (ver QUADRANTS más abajo), así
// las 4 piezas encastran en una sola imagen/color/video continuo mientras
// está cerrado, sin costuras.
function FullBackgroundContent({ settings, appearance, isAuto }) {
  if (isAuto) return <GlobalBackground appearance={appearance} fixed={false} />

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
  return <div className="absolute inset-0" style={{ backgroundColor: settings.bgColor || '#0a0a0a' }} />
}

// Cada cuadrante sabe hacia qué esquina de la pantalla "vive" (top/left, o
// bottom/right vía '50%') y hacia qué vértice tiene que volar al abrir
// (exitX/exitY, en % de su propio tamaño -- Framer Motion las interpreta
// relativas al elemento). bgOffsetX/Y es cuánto hay que correr el fondo de
// tamaño completo (100vw/100vh) para que ESTE cuadrante muestre justo su
// porción -- mismo par de números que exitX/exitY porque geométricamente
// es la misma cuenta (un cuarto de pantalla en cada eje).
const QUADRANTS = [
  { key: 'tl', top: '0', left: '0', exitX: '-100%', exitY: '-100%', bgOffsetX: '0', bgOffsetY: '0' },
  { key: 'tr', top: '0', left: '50%', exitX: '100%', exitY: '-100%', bgOffsetX: '-50vw', bgOffsetY: '0' },
  { key: 'bl', top: '50%', left: '0', exitX: '-100%', exitY: '100%', bgOffsetX: '0', bgOffsetY: '-50vh' },
  { key: 'br', top: '50%', left: '50%', exitX: '100%', exitY: '100%', bgOffsetX: '-50vw', bgOffsetY: '-50vh' },
]

function WelcomeScreen({ settings, appearance, guestName, welcomeMessage, onOpen }) {
  const [opening, setOpening] = useState(false)
  const [mediaColor, setMediaColor] = useState(null)
  const fontClass = FONT_FAMILY_CLASSES[settings.fontFamily] || 'font-sans'
  const isAuto = !settings.bgType || settings.bgType === 'auto'
  const bgColor = settings.bgColor || '#0a0a0a'

  // Saca el color promedio de la imagen/video elegido (mismo mecanismo que
  // ya se usa para esto) para que el color de contraste del texto (blanco u
  // oscuro automático) se calcule contra lo que realmente se ve, no contra
  // un color base que quedó sin usar.
  useEffect(() => {
    let cancelled = false
    if (settings.bgType === 'image' && settings.bgUrl) {
      extractDominantColor(settings.bgUrl)
        .then((color) => !cancelled && setMediaColor(color))
        .catch(() => !cancelled && setMediaColor(null))
    } else if (settings.bgType === 'video' && settings.bgUrl) {
      extractDominantColorFromVideo(settings.bgUrl)
        .then((color) => !cancelled && setMediaColor(color))
        .catch(() => !cancelled && setMediaColor(null))
    }
    return () => {
      cancelled = true
    }
  }, [settings.bgType, settings.bgUrl])

  const hasMediaBg = (settings.bgType === 'image' || settings.bgType === 'video') && Boolean(settings.bgUrl)
  const autoTextColor = getContrastTextColor(hasMediaBg && mediaColor ? mediaColor : bgColor)
  // Con fondo automático o imagen/video de por medio no se sabe de antemano
  // si va a ser claro u oscuro -- un velo sutil de abajo hacia arriba
  // mantiene el texto legible sin opinar sobre el resto. Con color plano
  // elegido a mano se deja limpio, sin velo (el usuario ya eligió un color
  // a propósito, oscurecerlo encima no lo respeta).
  const needsOverlay = isAuto || hasMediaBg

  function handleOpen() {
    setOpening(true)
    setTimeout(onOpen, 950)
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
    >
      {QUADRANTS.map((q) => (
        <motion.div
          key={q.key}
          className="absolute w-1/2 h-1/2 overflow-hidden"
          style={{ top: q.top, left: q.left }}
          initial={false}
          animate={opening ? { x: q.exitX, y: q.exitY, opacity: 0 } : { x: '0%', y: '0%', opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="absolute" style={{ width: '100vw', height: '100vh', left: q.bgOffsetX, top: q.bgOffsetY }}>
            <FullBackgroundContent settings={settings} appearance={appearance} isAuto={isAuto} />
          </div>
        </motion.div>
      ))}

      {needsOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.05) 55%, transparent)' }}
        />
      )}

      {/* Contenido: nombre VIP (si hay), textos y botón -- se desvanece
          entero apenas se toca el botón, mientras los 4 cuadrantes de
          fondo vuelan cada uno hacia su vértice detrás. */}
      <motion.div
        className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center gap-3"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.95 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Nameplate del invitado VIP -- a propósito NO dice "¡Hola" para no
            repetirse con el saludo (vipGreeting) que ya viene aparte en
            welcomeMessage más abajo. Es más una tarjeta de invitación real
            ("Invitación para fulano") que un mensaje de chat. */}
        {guestName && (
          <motion.div
            className="mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.3em] drop-shadow"
              style={{ color: `${settings.textColor || autoTextColor}99` }}
            >
              Invitación para
            </p>
            <p
              className="font-script text-2xl sm:text-3xl mt-1 drop-shadow-lg"
              style={{ color: appearance.primaryColor }}
            >
              {guestName}
            </p>
          </motion.div>
        )}

        {settings.titleText && (
          <motion.p
            className={cn(settings.fontSizeTitle || 'text-2xl', 'font-semibold tracking-wide drop-shadow-lg', fontClass)}
            style={{ color: `${settings.textColor || autoTextColor}` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {settings.titleText}
          </motion.p>
        )}

        {settings.subtitleText && (
          <motion.p
            className={cn(settings.fontSizeSubtitle || 'text-base', 'drop-shadow', fontClass)}
            style={{ color: `${settings.textColor || autoTextColor}d9` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {settings.subtitleText}
          </motion.p>
        )}

        {welcomeMessage && (
          <motion.p
            className={cn('text-sm max-w-sm drop-shadow', fontClass)}
            style={{ color: `${settings.textColor || autoTextColor}b3` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            {welcomeMessage}
          </motion.p>
        )}

        <motion.div
          className="mt-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
            <Button
              type="button"
              onClick={handleOpen}
              primaryColor={appearance.primaryColor}
              className={cn('px-10 sm:px-12 py-3.5 sm:py-4 tracking-wide text-base', fontClass)}
            >
              {settings.buttonText || 'Abrir invitación'}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WelcomeScreen
