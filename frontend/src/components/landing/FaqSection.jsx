import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { FAQ_CATEGORIES } from './faqData'
import { renderInline } from './markdownLite'

function FaqAnswer({ blocks }) {
  return (
    <div className="px-5 pb-5 space-y-3.5">
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          <ul key={i} className="space-y-2.5">
            {block.items.map((item) => (
              <li key={item.label} className="text-sm text-white/75 leading-relaxed">
                <strong style={{ color: item.color }}>{item.label}:</strong> {renderInline(item.text)}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-sm text-white/75 leading-relaxed">
            {renderInline(block.text)}
          </p>
        )
      )}
    </div>
  )
}

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-sm md:text-base">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
          style={{ color: BRAND.blue }}
        >
          <ChevronDown className="w-5 h-5" />
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
            <FaqAnswer blocks={faq.blocks} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FaqSection() {
  const [openKey, setOpenKey] = useState('0-0')

  return (
    <section id="faq" className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Centro de ayuda</p>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Todo lo que necesitás saber
        </h2>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        {FAQ_CATEGORIES.map((category, ci) => (
          <div key={category.title}>
            <p
              className="text-xs uppercase tracking-[0.2em] font-semibold mb-4"
              style={{ color: category.color }}
            >
              {category.title}
            </p>
            <div className="flex flex-col gap-3">
              {category.items.map((faq, ii) => {
                const key = `${ci}-${ii}`
                return (
                  <FaqItem
                    key={faq.question}
                    faq={faq}
                    isOpen={openKey === key}
                    onToggle={() => setOpenKey(openKey === key ? null : key)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
