import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { secondaryTextColor } from '../utils/color'

function InfoCard({ item, appearance, styles, config, isOpen, onToggle }) {
  const Icon = resolveIcon(item.icon, `${item.title || ''} ${item.body || ''}`)

  return (
    <motion.div
      layout
      className={cn(
        'text-left border shadow-lg overflow-hidden transition-colors',
        glassBlurClass(config),
        isOpen ? 'border-white/20' : 'border-white/10 hover:brightness-125',
        styles.card
      )}
      style={glassStyle(config, { boost: isOpen ? 3 : 0 })}
    >
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-4 text-left">
        <AnimatedIcon
          icon={Icon}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${appearance.primaryColor}22`, color: appearance.primaryColor }}
          iconClassName="w-4 h-4"
        />
        <span className="font-medium flex-1">{item.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24 }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="px-4 pb-4 pl-16 text-sm leading-relaxed whitespace-pre-line"
              style={{ color: secondaryTextColor(config.textColor, '99') }}
            >
              {item.body}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Info({ config, appearance, styles }) {
  const items = Array.isArray(config.items) ? config.items : []
  const [openIndex, setOpenIndex] = useState(0)
  const titleSize = config.fontSizeTitle || 'text-lg'

  if (items.length === 0) return null

  return (
    <section className={`px-6 max-w-2xl mx-auto ${styles.fontClass}`}>
      <h2
        className={`text-center ${titleSize} mb-6 ${styles.heading}`}
        style={{ color: config.textColor || undefined }}
      >
        {config.title || 'Información adicional'}
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
          >
            <InfoCard
              item={item}
              appearance={appearance}
              styles={styles}
              config={config}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Info
