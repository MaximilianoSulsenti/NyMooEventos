import { useState } from 'react'
import { motion } from 'motion/react'
import RsvpForm from '../components/RsvpForm'

function RSVPSection({ event, config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!event.activeModules?.guestControl) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <p className="text-white/70 mb-6">
        {config.title || 'Tu presencia es el mejor regalo. Contanos si nos acompañás.'}
      </p>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`px-8 py-3 font-medium tracking-wide shadow-lg ${styles.card}`}
        style={{ background: appearance.primaryColor, color: '#0a0a0a' }}
      >
        Confirmar asistencia
      </motion.button>

      {isOpen && <RsvpForm eventSlug={event.eventSlug} onClose={() => setIsOpen(false)} />}
    </section>
  )
}

export default RSVPSection
