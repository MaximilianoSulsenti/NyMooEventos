import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WhatsappIcon } from '../icons/BrandIcons'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero más información.'

// Las burbujitas aparecen una después de la otra poco después de cargar la
// landing (para llamar la atención sobre el botón), se ocultan, y el ciclo
// se repite cada tanto -- sin ser invasivo -- para volver a llamar la
// atención de alguien que se quedó navegando un rato largo.
const TEASER_MESSAGES = ['Estamos para ayudarte', '¿Comenzamos? 👋']
const FIRST_DELAY_MS = 1400
const HOLD_MS = 3000
const IDLE_BETWEEN_CYCLES_MS = 35000

function ChatTeaser() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    let timeoutId

    function after(ms, fn) {
      timeoutId = setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
    }

    function runCycle(delay) {
      after(delay, () => {
        setMessage(TEASER_MESSAGES[0])
        after(HOLD_MS, () => {
          setMessage(TEASER_MESSAGES[1])
          after(HOLD_MS, () => {
            setMessage(null)
            runCycle(IDLE_BETWEEN_CYCLES_MS)
          })
        })
      })
    }

    runCycle(FIRST_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute bottom-full right-0 mb-3 pointer-events-none"
        >
          <div className="relative whitespace-nowrap bg-neutral-900/95 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-2xl rounded-br-md shadow-2xl backdrop-blur-sm">
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
