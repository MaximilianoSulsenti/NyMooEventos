import { motion } from 'motion/react'

function Hero({ event, config, appearance, styles }) {
  const title = config.title || event.eventName
  const subtitle = config.subtitle || ''
  const titleSize = config.fontSizeTitle || 'text-4xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'

  return (
    <section className={`min-h-[70vh] flex flex-col items-center justify-center text-center px-6 ${styles.fontClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <p className="uppercase tracking-[0.3em] text-xs mb-4" style={{ color: appearance.primaryColor }}>
          Te invitamos a celebrar
        </p>
        <h1 className={`${titleSize} md:text-5xl mb-3 ${styles.heading}`}>{title}</h1>
        {subtitle && <p className={`text-white/70 mt-2 ${subtitleSize}`}>{subtitle}</p>}
        <div className={`${styles.divider} my-6 mx-auto`} style={{ background: appearance.primaryColor }} />
      </motion.div>
    </section>
  )
}

export default Hero
