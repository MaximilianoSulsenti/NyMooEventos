import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Disc3, Pause, Play } from 'lucide-react'

const POSITION_CLASSES = {
  'top-left': 'top-5 left-5',
  'top-right': 'top-5 right-5',
  'bottom-left': 'bottom-5 left-5',
  'bottom-right': 'bottom-5 right-5',
}

// autoPlayTrigger: cualquier valor que cambie (o llegue en true) justo cuando
// hubo un gesto real del usuario (ej. abrir el sobre), para intentar arrancar
// la música ahí — si el navegador igual lo bloquea, queda disponible el botón.
function MusicPlayerWidget({ settings, primaryColor, autoPlayTrigger }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = (settings.volume ?? 70) / 100
  }, [settings.volume])

  useEffect(() => {
    if (!autoPlayTrigger || !audioRef.current) return
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true)
        setShowLabel(true)
        setTimeout(() => setShowLabel(false), 4000)
      })
      .catch(() => {
        // El navegador bloqueó el autoplay: el usuario puede tocar el ícono.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayTrigger])

  function toggle() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  if (!settings?.audioUrl) return null

  const position = settings.position || 'bottom-right'
  const isRightSide = position.includes('right')

  return (
    <div
      className={`fixed z-40 flex items-center gap-2 ${POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right']} ${
        isRightSide ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <audio ref={audioRef} src={settings.audioUrl} loop preload="none" />

      <AnimatePresence>
        {showLabel && settings.title && (
          <motion.div
            initial={{ opacity: 0, x: isRightSide ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-full backdrop-blur-md bg-black/50 border border-white/10 px-3 py-1.5 text-xs text-white/80 shadow-lg whitespace-nowrap"
          >
            {settings.title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        className="relative w-12 h-12 rounded-full flex items-center justify-center border border-white/15 shadow-xl backdrop-blur-md shrink-0"
        style={{ background: `${primaryColor}33` }}
      >
        <motion.span
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
          style={{ color: primaryColor }}
        >
          <Disc3 className="w-6 h-6" />
        </motion.span>
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black/70 border border-white/20 flex items-center justify-center">
          {isPlaying ? (
            <Pause className="w-2 h-2 text-white fill-white" />
          ) : (
            <Play className="w-2 h-2 text-white fill-white" />
          )}
        </span>
      </motion.button>
    </div>
  )
}

export default MusicPlayerWidget
