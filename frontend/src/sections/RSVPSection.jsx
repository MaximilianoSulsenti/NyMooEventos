import { useState } from 'react'
import { motion } from 'motion/react'
import { HeartHandshake } from 'lucide-react'
import RsvpForm from '../components/RsvpForm'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'

function RSVPSection({ event, config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)
  const primaryColor = appearance?.primaryColor

  if (!event.activeModules?.guestControl) return null

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          'relative flex flex-col items-center gap-4 text-center border overflow-hidden mx-auto max-w-md px-8 py-10',
          glassBlurClass(config),
          styles.card
        )}
        style={{
          ...glassStyle(config),
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: primaryColor }} />

        <AnimatedIcon
          icon={HeartHandshake}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${primaryColor}22`, color: primaryColor }}
          iconClassName="w-6 h-6"
        />

        <p className="text-white/70 max-w-sm">
          {config.title || 'Tu presencia es el mejor regalo. Contanos si nos acompañás.'}
        </p>

        <Button type="button" onClick={() => setIsOpen(true)} primaryColor={primaryColor}>
          Confirmar asistencia
        </Button>
      </motion.div>

      {isOpen && (
        <RsvpForm
          eventSlug={event.eventSlug}
          primaryColor={primaryColor}
          dietaryOptions={config.dietaryOptions}
          extraQuestions={config.extraQuestions}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}

export default RSVPSection
