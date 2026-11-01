import { motion } from 'motion/react'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import { cn } from '../utils/cn'
import { secondaryTextColor, titleTextStyle, secondaryGlassStyle, titleGlassColor } from '../utils/color'

function Timeline({ config, appearance, styles }) {
  const items = Array.isArray(config.items) ? config.items : []
  const titleSize = config.fontSizeTitle || 'text-lg'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const bodySize = config.fontSizeBody || 'text-base'
  const secondaryColor = config.textColorSecondary || config.textColor
  const secondaryColorExplicit = Boolean(config.textColorSecondary)
  const glassBg = config.textGlassBg === 'si'
  const glassBgStyle = glassBg ? secondaryGlassStyle(secondaryColor, config.textGlassOpacity) : null
  const titleGlassBg = config.titleGlassBg === 'si'
  const titleGlassBgStyle = titleGlassBg ? secondaryGlassStyle(titleGlassColor(config), config.textGlassOpacity) : null
  if (items.length === 0) return null

  return (
    <section className={`text-center px-6 max-w-sm mx-auto ${styles.fontClass}`}>
      <h2
        className={cn(titleSize, config.subtitle ? 'mb-1' : 'mb-6', styles.heading, titleGlassBg && 'block w-fit mx-auto backdrop-blur-lg rounded-2xl px-5 py-2')}
        style={{ ...titleTextStyle(config), ...titleGlassBgStyle }}
      >
        {config.title || 'Cronograma'}
      </h2>
      {config.subtitle && (
        <p
          className={cn('mb-6', subtitleSize, glassBg && 'block w-fit mx-auto backdrop-blur-lg rounded-2xl px-4 py-1.5')}
          style={{ color: secondaryTextColor(secondaryColor, 'b3', secondaryColorExplicit), ...glassBgStyle }}
        >
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
                <span className={`font-semibold ${bodySize}`} style={{ color: appearance.primaryColor }}>
                  {item.time}
                </span>
                <p
                  className={cn(bodySize, glassBg && 'block w-fit mx-auto backdrop-blur-lg rounded-2xl px-4 py-1.5')}
                  style={{ color: secondaryTextColor(secondaryColor, 'b3', secondaryColorExplicit), ...glassBgStyle }}
                >
                  {item.label}
                </p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

export default Timeline
