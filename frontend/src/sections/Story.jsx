import { motion } from 'motion/react'
import { Heart } from 'lucide-react'

function Story({ config, appearance, styles }) {
  const milestones = Array.isArray(config.milestones) ? config.milestones : []
  const isHorizontal = config.layout === 'horizontal'
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const bodySize = config.fontSizeBody || 'text-base'

  if (!config.title && !config.body && milestones.length === 0) return null

  return (
    <section className={`text-center px-6 max-w-2xl mx-auto ${styles.fontClass}`}>
      {config.title && (
        <h2 className={`${titleSize} mb-4 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
          {config.title}
        </h2>
      )}
      <div className={`${styles.divider} mx-auto mb-4`} style={{ background: appearance.primaryColor }} />
      {config.body && <p className={`text-white/70 whitespace-pre-line mb-8 ${bodySize}`}>{config.body}</p>}

      {milestones.length > 0 && (
        <div className={isHorizontal ? 'flex gap-6 overflow-x-auto pb-4 snap-x' : 'flex flex-col gap-8 text-left max-w-md mx-auto'}>
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={isHorizontal ? 'shrink-0 w-56 snap-center' : 'relative pl-8'}
            >
              {!isHorizontal && (
                <span
                  className="absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: appearance.primaryColor }}
                >
                  <Heart className="w-3 h-3 text-black" />
                </span>
              )}
              {milestone.title && (
                <p className="text-sm font-semibold" style={{ color: appearance.primaryColor }}>
                  {milestone.title}
                </p>
              )}
              {milestone.subtitle && <p className="text-white/70 mt-1">{milestone.subtitle}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Story
