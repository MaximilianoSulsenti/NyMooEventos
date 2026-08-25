import { motion, AnimatePresence } from 'motion/react'
import { X, CreditCard } from 'lucide-react'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

// Info del costo de la tarjeta del salón, cargada por el organizador en
// RsvpSettingsPanel (rsvpSettings.guestCard*) -- texto libre a propósito,
// igual que guestCardDetails.pricePerCard en el Order, porque no siempre
// hay un número cerrado ("a confirmar", "USD 20", etc.).
function GuestCardPriceModal({ adultPrice, minorPrice, description, primaryColor, onClose }) {
  useLockBodyScroll()

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
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: `${primaryColor}22`, color: primaryColor }}
          >
            <CreditCard className="w-5 h-5" />
          </span>

          <h2 className="text-lg font-semibold mb-4">Valor de la tarjeta</h2>

          <div className="space-y-2.5">
            {adultPrice && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <span className="text-sm text-white/70">Adultos</span>
                <span className="font-semibold">{adultPrice}</span>
              </div>
            )}
            {minorPrice && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <span className="text-sm text-white/70">Menores</span>
                <span className="font-semibold">{minorPrice}</span>
              </div>
            )}
          </div>

          {description && <p className="text-white/50 text-sm leading-relaxed mt-4">{description}</p>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GuestCardPriceModal
