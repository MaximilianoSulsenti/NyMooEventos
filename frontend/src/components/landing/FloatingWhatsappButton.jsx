import { motion } from 'motion/react'
import { WhatsappIcon } from '../icons/BrandIcons'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero más información.'

// Ícono flotante fijo abajo a la derecha, visible en todo momento mientras
// se scrollea la landing -- reemplaza al botón "Chatear" que antes vivía
// arriba en el navbar (quedaba fuera de vista apenas se bajaba un poco).
function FloatingWhatsappButton() {
  return (
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
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
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
  )
}

export default FloatingWhatsappButton
