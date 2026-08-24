import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Zap, Check } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { FAQ_CATEGORIES, DUO_INFO } from './faqData'

const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`

// Parser de markdown livianito: **negrita** y *cursiva*, nada más -- así el
// contenido de faqData.js queda como texto plano fácil de editar, sin
// mezclar JSX en la data.
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

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

function DuoPromo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto mt-14 relative rounded-3xl p-px"
      style={{ background: BRAND_GRADIENT }}
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-neutral-950/90 backdrop-blur-xl p-7 md:p-9">
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${BRAND.lime}22`, border: `1px solid ${BRAND.lime}45` }}
          >
            <Zap className="w-4.5 h-4.5" style={{ color: BRAND.lime }} />
          </span>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: BRAND.lime }}>
            Servicio exclusivo
          </p>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">{DUO_INFO.title}</h3>

        <p className="text-white/75 text-sm leading-relaxed mb-4">{renderInline(DUO_INFO.intro)}</p>

        <ul className="space-y-2.5 mb-5">
          {DUO_INFO.scenarios.map((s) => (
            <li key={s.label} className="flex items-start gap-2.5 text-sm text-white/75 leading-relaxed">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BRAND.lime }} />
              <span className="min-w-0">
                <strong className="text-white font-semibold">{s.label}:</strong> {s.text}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-white/75 text-sm leading-relaxed">{renderInline(DUO_INFO.outro)}</p>
      </div>
    </motion.div>
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

      <DuoPromo />
    </section>
  )
}

export default FaqSection
