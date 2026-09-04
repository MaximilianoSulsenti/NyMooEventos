import { motion } from 'motion/react'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

function Timeline({ config, appearance, styles }) {
  const items = Array.isArray(config.items) ? config.items : []
  const titleSize = config.fontSizeTitle || 'text-lg'
  if (items.length === 0) return null

  return (
    <section className={`text-center px-6 max-w-sm mx-auto ${styles.fontClass}`}>
      <h2 className={`${titleSize} ${config.subtitle ? 'mb-1' : 'mb-6'} ${styles.heading}`} style={titleTextStyle(config)}>
        {config.title || 'Cronograma'}
      </h2>
      {config.subtitle && (
        <p className="mb-6" style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.subtitle}
        </p>
      )}
      <ol className="space-y-4 text-left">
        {items.map((item, index) => {
          const Icon = resolveIcon(item.icon, item.label)
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex gap-4 items-center"
            >
              <AnimatedIcon
                icon={Icon}
                delay={index * 0.06}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10"
                style={{ color: appearance.primaryColor }}
                iconClassName="w-4 h-4"
              />
              <div>
                <span className="font-semibold text-sm" style={{ color: appearance.primaryColor }}>
                  {item.time}
                </span>
                <p style={{ color: secondaryTextColor(config.textColor, 'b3') }}>{item.label}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

export default Timeline
