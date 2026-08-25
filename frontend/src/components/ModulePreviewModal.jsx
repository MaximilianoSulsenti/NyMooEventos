import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles } from 'lucide-react'
import Button from './ui/Button'
import { WhatsappIcon } from './icons/BrandIcons'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import { LANDING_CONTACT, buildWhatsappUrl } from '../utils/landingConfig'

// Se muestra en vez del formulario real cuando el invitado toca "Subir
// fotos"/"Compartir mis fotos" en una sección que el organizador dejó
// habilitada en el editor, pero cuyo módulo (galería en vivo / álbum QR)
// todavía no está activo para el evento (ver activeModules en
// backend/models/Event.js). Antes esto directamente ocultaba la sección
// entera; ahora se ve, y al usarla explica la función en vez de un error.
function ModulePreviewModal({ title, paragraphs, primaryColor, eventName, onClose }) {
  useLockBodyScroll()
  const message = `¡Hola Nymoo! Quiero activar "${title}" para mi evento${eventName ? ` (${eventName})` : ''}.`

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
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
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
            <Sparkles className="w-5 h-5" />
          </span>

          <h2 className="text-lg font-semibold mb-3">{title}</h2>

          <div className="space-y-3 text-white/70 text-sm leading-relaxed mb-6">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <p className="text-white/40 text-xs mb-4">Este espacio todavía no está activo para tu evento -- escribinos para sumarlo.</p>

          <Button
            as="a"
            href={buildWhatsappUrl(message, LANDING_CONTACT.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            primaryColor={primaryColor}
            className="w-full justify-center"
          >
            <WhatsappIcon className="w-4 h-4" />
            Consultar por WhatsApp
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ModulePreviewModal
