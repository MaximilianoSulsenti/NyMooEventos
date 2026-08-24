import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WhatsappIcon } from '../icons/BrandIcons'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero más información.'

// Las burbujitas aparecen una después de la otra apenas se carga la landing
// (para llamar la atención sobre el botón), y después se quedan ocultas --
// el botón sigue disponible para clickear en cualquier momento.
const TEASER_MESSAGES = ['Estamos para ayudarte', '¿Comenzamos? 👋']

function ChatTeaser() {
  const [step, setStep] = useState(0) // 0 = nada, 1/2 = índice+1 del mensaje, 3 = terminado

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 4200),
      setTimeout(() => setStep(3), 7200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const message = step === 1 ? TEASER_MESSAGES[0] : step === 2 ? TEASER_MESSAGES[1] : null

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute bottom-full right-0 mb-3 max-w-[13rem]"
        >
          <div className="relative bg-neutral-900/95 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-2xl rounded-br-md shadow-2xl backdrop-blur-sm">
            {message}
            <span className="absolute -bottom-1.5 right-5 w-3 h-3 bg-neutral-900/95 border-r border-b border-white/10 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Ícono flotante fijo abajo a la derecha, visible en todo momento mientras
// se scrollea la landing -- reemplaza al botón "Chatear" que antes vivía
// arriba en el navbar (quedaba fuera de vista apenas se bajaba un poco).
function FloatingWhatsappButton() {
  return (
    <div className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50">
      <div className="relative">
        <ChatTeaser />
        <motion.a
          href={buildWhatsappUrl(WHATSAPP_MESSAGE, LANDING_CONTACT.whatsappNumber)}
          target="_blank"
          rel="noreferrer"
          aria-label="Chatear por WhatsApp"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
          style={{ background: '#25D366', boxShadow: '0 8px 24px -6px rgba(37,211,102,0.6)' }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: '#25D366' }}
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.55, 0, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <WhatsappIcon className="w-7 h-7 md:w-8 md:h-8 relative text-white" />
        </motion.a>
      </div>
    </div>
  )
}

export default FloatingWhatsappButton
