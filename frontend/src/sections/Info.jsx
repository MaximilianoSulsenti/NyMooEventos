import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

function parseItems(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split('|')
      return { title: title.trim(), body: rest.join('|').trim() }
    })
}

function AccordionItem({ item, isOpen, onToggle, styles }) {
  return (
    <div className={`border border-white/10 bg-white/5 overflow-hidden ${styles.card}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{item.title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/60" />
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
            <p className="px-4 pb-4 text-white/70 text-sm">{item.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Info({ config, styles }) {
  const items = parseItems(config.items)
  const [openIndex, setOpenIndex] = useState(0)
  const titleSize = config.fontSizeTitle || 'text-lg'

  if (items.length === 0) return null

  return (
    <section className={`px-6 max-w-md mx-auto ${styles.fontClass}`}>
      <h2 className={`text-center ${titleSize} mb-4 ${styles.heading}`}>Información adicional</h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            styles={styles}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </section>
  )
}

export default Info
