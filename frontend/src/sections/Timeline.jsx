import { motion } from 'motion/react'
import { Church, PartyPopper, UtensilsCrossed, Music, Camera, Clock } from 'lucide-react'

const ICON_RULES = [
  { keywords: ['civil', 'ceremonia', 'iglesia'], icon: Church },
  { keywords: ['recepcion', 'recepción', 'fiesta', 'salon', 'salón'], icon: PartyPopper },
  { keywords: ['cena', 'almuerzo', 'brindis'], icon: UtensilsCrossed },
  { keywords: ['baile', 'musica', 'música', 'dj'], icon: Music },
  { keywords: ['foto'], icon: Camera },
]

function pickIcon(label = '') {
  const normalized = label.toLowerCase()
  const match = ICON_RULES.find((rule) => rule.keywords.some((k) => normalized.includes(k)))
  return match ? match.icon : Clock
}

function Timeline({ config, appearance, styles }) {
  const items = Array.isArray(config.items) ? config.items : []
  const titleSize = config.fontSizeTitle || 'text-lg'
  if (items.length === 0) return null

  return (
    <section className={`text-center px-6 max-w-sm mx-auto ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        {config.title || 'Cronograma'}
      </h2>
      <ol className="space-y-4 text-left">
        {items.map((item, index) => {
          const Icon = pickIcon(item.label)
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex gap-4 items-center"
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10"
                style={{ color: appearance.primaryColor }}
              >
                <Icon className="w-4 h-4" />
              </span>
              <div>
                <span className="font-semibold text-sm" style={{ color: appearance.primaryColor }}>
                  {item.time}
                </span>
                <p className="text-white/70">{item.label}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

export default Timeline
