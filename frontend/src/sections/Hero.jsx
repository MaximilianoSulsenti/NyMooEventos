import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import usePremiumGuest from '../hooks/usePremiumGuest'

function Hero({ event, config, appearance, styles }) {
  const kicker = config.kicker || 'Te invitamos a celebrar'
  const title = config.title || event.eventName
  const subtitle = config.subtitle || ''
  const titleSize = config.fontSizeTitle || 'text-4xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const premiumGuest = usePremiumGuest(event)
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
        {subtitle && <p className={`text-white/70 mt-2 ${subtitleSize}`}>{subtitle}</p>}
        <div className={`${styles.divider} my-6 mx-auto`} style={{ background: appearance.primaryColor }} />
        {config.dedication && (
          <p className="text-white/50 text-sm italic mt-2 max-w-sm mx-auto">{config.dedication}</p>
        )}
      </motion.div>
    </section>
  )
}

export default Hero
