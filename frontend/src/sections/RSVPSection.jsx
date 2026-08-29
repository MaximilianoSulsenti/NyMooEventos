import { useState } from 'react'
import { motion } from 'motion/react'
import { HeartHandshake, CreditCard } from 'lucide-react'
import RsvpForm from '../components/RsvpForm'
import PremiumRsvpGate from '../components/PremiumRsvpGate'
import GuestCardPriceModal from '../components/GuestCardPriceModal'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { WhatsappIcon } from '../components/icons/BrandIcons'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'
import { CARD_REVEAL } from '../utils/motionPresets'
import { secondaryTextColor } from '../utils/color'

const WHATSAPP_GREEN = '#25D366'

function RSVPSection({ event, config, appearance, styles }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const primaryColor = appearance?.primaryColor
  const rsvpType = event.rsvpSettings?.rsvpType || 'intermedio_db'
  const guestCardEnabled = Boolean(
    event.rsvpSettings?.guestCardEnabled && (event.rsvpSettings?.guestCardAdultPrice || event.rsvpSettings?.guestCardMinorPrice)
  )
  // Las invitaciones VIP son un módulo aparte (se vende y se activa por su
  // cuenta), no una opción más del selector de plan -- cuando está prendido
  // manda por encima de básico/intermedio.
  const vipEnabled = Boolean(event.activeModules?.vipInvitations)
  const isWhatsapp = !vipEnabled && rsvpType === 'basico_whatsapp'

  if (!event.activeModules?.guestControl) return null
  // Plan básico sin número cargado: no hay nada a donde mandar el mensaje,
  // así que la sección directamente no aparece.
  if (isWhatsapp && !event.rsvpSettings?.whatsappNumber) return null

  const accentColor = isWhatsapp ? WHATSAPP_GREEN : primaryColor

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        {...CARD_REVEAL}
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
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: accentColor }} />

        <AnimatedIcon
          icon={isWhatsapp ? WhatsappIcon : HeartHandshake}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${accentColor}22`, color: accentColor }}
          iconClassName="w-6 h-6"
        />

        <p className="max-w-sm" style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.title ||
            (isWhatsapp
              ? 'Confirmá tu asistencia por WhatsApp, así lo vemos al toque.'
              : 'Tu presencia es el mejor regalo. Contanos si nos acompañás.')}
        </p>

        <Button type="button" onClick={() => setIsOpen(true)} primaryColor={accentColor}>
          {isWhatsapp && <WhatsappIcon className="w-4 h-4" />}
          {isWhatsapp ? config.buttonTextWhatsapp || 'Confirmar por WhatsApp' : config.buttonTextForm || 'Confirmar asistencia'}
        </Button>

        {guestCardEnabled && (
          <button
            type="button"
            onClick={() => setShowPrice(true)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {config.priceButtonText || 'Ver valor de la tarjeta'}
          </button>
        )}
      </motion.div>

      {showPrice && (
        <GuestCardPriceModal
          adultPrice={event.rsvpSettings?.guestCardAdultPrice}
          minorPrice={event.rsvpSettings?.guestCardMinorPrice}
          description={event.rsvpSettings?.guestCardDescription}
          primaryColor={accentColor}
          onClose={() => setShowPrice(false)}
        />
      )}

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
          primaryColor={accentColor}
          dietaryOptions={config.dietaryOptions}
          extraQuestions={config.extraQuestions}
          onClose={() => setIsOpen(false)}
          mode={isWhatsapp ? 'whatsapp' : 'save'}
          eventName={event.eventName}
          whatsappNumber={event.rsvpSettings?.whatsappNumber}
          whatsappMessage={event.rsvpSettings?.whatsappMessage}
        />
      )}
    </section>
  )
}

export default RSVPSection
