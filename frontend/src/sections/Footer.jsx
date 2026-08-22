import { motion } from 'motion/react'
import { MessageCircle, Mail, Phone, Music2, Globe } from 'lucide-react'

const ICON_RULES = [
  { keywords: ['whatsapp', 'wsp'], icon: MessageCircle },
  { keywords: ['mail', 'correo', 'email'], icon: Mail },
  { keywords: ['tel', 'phone', 'llamar', 'contacto'], icon: Phone },
  { keywords: ['spotify', 'tiktok', 'playlist', 'musica', 'música'], icon: Music2 },
]

function pickSocialIcon(label = '') {
  const normalized = label.toLowerCase()
  const match = ICON_RULES.find((rule) => rule.keywords.some((k) => normalized.includes(k)))
  return match ? match.icon : Globe
}

function parseSocialLinks(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|').map((part) => part?.trim())
      return { label: label || 'Link', url: url || '#' }
    })
}

function Footer({ event, config, appearance, styles }) {
  const socialLinks = parseSocialLinks(config.socialLinks)
  const primaryColor = appearance?.primaryColor
  const nameSize = config.fontSizeTitle || 'text-2xl'

  return (
    <section className={`relative text-center px-6 pt-14 pb-12 overflow-hidden ${styles.fontClass}`}>
      <div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: primaryColor }}
      />

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`${styles.divider} mx-auto mb-8`}
        style={{ background: primaryColor }}
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-white/60 text-sm italic max-w-md mx-auto"
      >
        {config.text || `Con cariño, esperamos verte en ${event.eventName}.`}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`mt-4 ${nameSize} ${styles.heading}`}
        style={{ color: config.textColor || primaryColor }}
      >
        {event.eventName}
      </motion.p>

      {socialLinks.length > 0 && (
        <div className="flex justify-center flex-wrap gap-3 mt-8">
          {socialLinks.map((link, index) => {
            const Icon = pickSocialIcon(link.label)
            return (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.12, y: -2, borderColor: primaryColor, color: primaryColor }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 18 }}
                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 text-white/60 shadow-lg backdrop-blur-sm"
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            )
          })}
        </div>
      )}

      {config.signature && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/30 text-xs mt-8 uppercase tracking-[0.15em]"
        >
          {config.signature}
        </motion.p>
      )}
    </section>
  )
}

export default Footer
