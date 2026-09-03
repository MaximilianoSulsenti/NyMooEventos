import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

// Chrome compartido de todos los modales del flujo de RSVP (confirmar
// asistencia, buscar invitación VIP, "ya confirmaste", info Dúo) -- antes
// duplicado a mano en cada archivo; ahora vive en un solo lugar así el
// color de fondo y de texto configurables (RSVPSection.config.modalBgColor
// / modalTextColor) se aplican parejo en los cuatro sin repetir la lógica
// de sombras/gradiente cuatro veces.
function RsvpModalShell({ accentColor = '#a855f7', bgColor, textColor, onClose, children }) {
  useLockBodyScroll()
  const light = shadeColor(accentColor, 25)
  const dark = shadeColor(accentColor, -25)
  const bg = bgColor || '#171717'
  const text = textColor || '#ffffff'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        style={{ '--accent': accentColor }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl p-px w-full max-w-md shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${light}90, transparent 45%, ${dark}70)` }}
        >
          <div
            className="rounded-[calc(1.5rem-1px)] p-6 relative max-h-[90vh] overflow-y-auto"
            style={{ background: bg, color: text }}
          >
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: text }}
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RsvpModalShell
