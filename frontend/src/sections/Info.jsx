import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Info as InfoIcon, Shirt, Hotel, Car, Gift, Baby, Utensils, Phone } from 'lucide-react'
import { cn } from '../utils/cn'

const ICONS = {
  info: InfoIcon,
  dresscode: Shirt,
  hotel: Hotel,
  transport: Car,
  gift: Gift,
  kids: Baby,
  food: Utensils,
  contact: Phone,
}

function InfoCard({ item, appearance, styles, isOpen, onToggle }) {
  const Icon = ICONS[item.icon] || InfoIcon

  return (
    <motion.div
      layout
      className={cn(
        'text-left border shadow-lg overflow-hidden transition-colors',
        isOpen ? 'border-white/20 bg-white/[0.07]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]',
        styles.card
      )}
    >
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-4 text-left">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${appearance.primaryColor}22`, color: appearance.primaryColor }}
        >
          <Icon className="w-4 h-4" />
        </span>
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-16 text-white/60 text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
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
        Información adicional
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
