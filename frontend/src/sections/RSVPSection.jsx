import { useState } from 'react'
import { motion } from 'motion/react'
import { HeartHandshake, MessageCircle } from 'lucide-react'
import RsvpForm from '../components/RsvpForm'
import PremiumRsvpGate from '../components/PremiumRsvpGate'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'
import { CARD_REVEAL } from '../utils/motionPresets'

const WHATSAPP_GREEN = '#25D366'

function buildWhatsappUrl(event) {
  const settings = event.rsvpSettings || {}
  const digits = (settings.whatsappNumber || '').replace(/\D/g, '')
  const message =
    settings.whatsappMessage?.trim() ||
    `¡Hola! Quiero confirmar mi asistencia para el evento ${event.eventName}.`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function RSVPSection({ event, config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)
  const primaryColor = appearance?.primaryColor
  const rsvpType = event.rsvpSettings?.rsvpType || 'intermedio_db'
  // Las invitaciones VIP son un módulo aparte (se vende y se activa por su
  // cuenta), no una opción más del selector de plan -- cuando está prendido
  // manda por encima de básico/intermedio.
  const vipEnabled = Boolean(event.activeModules?.vipInvitations)

  if (!event.activeModules?.guestControl) return null

  const cardClassName = cn(
    'relative flex flex-col items-center gap-4 text-center border overflow-hidden mx-auto max-w-md px-8 py-10',
    glassBlurClass(config),
    styles.card
  )
  const cardStyle = {
    ...glassStyle(config),
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
  }

  // Plan básico: no hay formulario ni datos guardados, solo un redirect a
  // WhatsApp con el mensaje pre-armado. Sin número cargado no hay nada que
  // mostrar, así que la sección directamente no aparece.
  if (!vipEnabled && rsvpType === 'basico_whatsapp') {
    if (!event.rsvpSettings?.whatsappNumber) return null

    return (
      <section className={`px-6 ${styles.fontClass}`}>
        <motion.div {...CARD_REVEAL} className={cardClassName} style={cardStyle}>
          <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: WHATSAPP_GREEN }} />

          <AnimatedIcon
            icon={MessageCircle}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `${WHATSAPP_GREEN}22`, color: WHATSAPP_GREEN }}
            iconClassName="w-6 h-6"
          />

          <p className="text-white/70 max-w-sm">
            {config.title || 'Confirmá tu asistencia por WhatsApp, así lo vemos al toque.'}
          </p>

          <Button as="a" href={buildWhatsappUrl(event)} target="_blank" rel="noopener noreferrer" primaryColor={WHATSAPP_GREEN}>
            <MessageCircle className="w-4 h-4" />
            Confirmar por WhatsApp
          </Button>
        </motion.div>
      </section>
    )
  }

  // El formulario normal y el gate VIP comparten la misma tarjeta de
  // entrada; lo único que cambia es qué se abre al tocar el botón.
  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div {...CARD_REVEAL} className={cardClassName} style={cardStyle}>
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

      {isOpen && vipEnabled && (
        <PremiumRsvpGate
          event={event}
          primaryColor={primaryColor}
          dietaryOptions={config.dietaryOptions}
          extraQuestions={config.extraQuestions}
          onClose={() => setIsOpen(false)}
        />
      )}

      {isOpen && !vipEnabled && (
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
