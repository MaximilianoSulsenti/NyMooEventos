import { useState } from 'react'
import RsvpForm from '../components/RsvpForm'
import Button from '../components/ui/Button'

function RSVPSection({ event, config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!event.activeModules?.guestControl) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <p className="text-white/70 mb-6">
        {config.title || 'Tu presencia es el mejor regalo. Contanos si nos acompañás.'}
      </p>
      <Button type="button" onClick={() => setIsOpen(true)} primaryColor={appearance.primaryColor}>
        Confirmar asistencia
      </Button>

      {isOpen && (
        <RsvpForm
          eventSlug={event.eventSlug}
          primaryColor={appearance.primaryColor}
          dietaryOptions={config.dietaryOptions}
          extraQuestions={config.extraQuestions}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}

export default RSVPSection
