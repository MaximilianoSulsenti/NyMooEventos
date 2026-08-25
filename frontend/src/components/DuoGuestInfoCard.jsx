import { motion, AnimatePresence } from 'motion/react'
import { X, PartyPopper } from 'lucide-react'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

// Reemplaza al RsvpForm cuando el evento es una Invitación Dúo de un
// original con invitaciones VIP -- el invitado ya confirmó su asistencia en
// la invitación principal, así que acá no vuelve a pedirse RSVP: solo se
// muestra la info que cargó el organizador (rsvpSettings.duoInfoDescription
// en RsvpSettingsPanel.jsx) una vez identificado por nombre o passcode.
function DuoGuestInfoCard({ guestName, title, description, primaryColor = '#a855f7', onClose }) {
  useLockBodyScroll()
  const light = shadeColor(primaryColor, 25)
  const dark = shadeColor(primaryColor, -25)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl p-px w-full max-w-md shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${light}90, transparent 45%, ${dark}70)` }}
        >
          <div className="bg-neutral-900 text-white rounded-[calc(1.5rem-1px)] p-6 relative max-h-[90vh] overflow-y-auto text-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <span
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `${primaryColor}22`, color: primaryColor }}
            >
              <PartyPopper className="w-7 h-7" />
            </span>

            <p className="text-neutral-400 text-sm mb-1">¡Hola, {guestName}!</p>
            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            {description ? (
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">{description}</p>
            ) : (
              <p className="text-neutral-500 text-sm">Ya tenés tu lugar confirmado -- ¡te esperamos!</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DuoGuestInfoCard
