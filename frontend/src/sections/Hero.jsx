import { motion } from 'motion/react'
import { Sparkles, CalendarDays } from 'lucide-react'
import usePremiumGuest from '../hooks/usePremiumGuest'
import { secondaryTextColor } from '../utils/color'

function Hero({ event, config, appearance, styles }) {
  const kicker = config.kicker || 'Te invitamos a celebrar'
  const title = config.title || event.eventName
  const subtitle = config.subtitle || ''
  const titleSize = config.fontSizeTitle || 'text-4xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const premiumGuest = usePremiumGuest(event)
  // Fecha/hora sofisticada en la portada -- opcional (config.showDate),
  // apagada por defecto para no cambiarle la cara a ninguna invitación ya
  // armada. A propósito NO es un widget robusto tipo EventDetail (nada de
  // número gigante ni tarjeta propia): es una línea chica, a la altura del
  // subtítulo, como una aclaración más que un elemento aparte.
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = eventDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  // {nombre} en el template se reemplaza por el nombre real del invitado VIP.
  const vipGreeting = (config.vipGreeting || '¡Hola, {nombre}! Están cordialmente invitados').replace(
    '{nombre}',
    premiumGuest?.name || ''
  )

  return (
    <section className={`min-h-[70vh] flex flex-col items-center justify-center text-center px-6 ${styles.fontClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {premiumGuest && (
          <motion.p
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: `${appearance.primaryColor}22`,
              color: appearance.primaryColor,
              border: `1px solid ${appearance.primaryColor}40`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {vipGreeting}
          </motion.p>
        )}
        {kicker && (
          <p className="uppercase tracking-[0.3em] text-xs mb-4" style={{ color: appearance.primaryColor }}>
            {kicker}
          </p>
        )}
        <h1
          className={`${titleSize} md:text-5xl mb-3 ${styles.heading}`}
          style={{ color: config.textColor || undefined }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-2 ${subtitleSize}`} style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
            {subtitle}
          </p>
        )}
        {config.showDate && (
          <p
            className="flex items-center justify-center gap-1.5 mt-2 text-xs sm:text-sm tracking-wide"
            style={{ color: secondaryTextColor(config.textColor, '99') }}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: appearance.primaryColor }} />
            {formattedDate} · {formattedTime} hs
          </p>
        )}
        <div className={`${styles.divider} my-6 mx-auto`} style={{ background: appearance.primaryColor }} />
        {config.dedication && (
          <p className="text-sm italic mt-2 max-w-sm mx-auto" style={{ color: secondaryTextColor(config.textColor, '80') }}>
            {config.dedication}
          </p>
        )}
      </motion.div>
    </section>
  )
}

export default Hero
