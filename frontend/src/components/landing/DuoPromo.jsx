import { motion } from 'motion/react'
import { Zap, Check } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { DUO_INFO } from './faqData'
import { renderInline } from './markdownLite'

const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`

// Vive pegado a las cards de packs (ver ServicesSection.jsx) a propósito --
// es el complemento natural de "ya elegiste tu pack", así que conviene
// verlo ahí mismo en vez de mezclado más abajo entre las preguntas frecuentes.
function DuoPromo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto mt-10 md:mt-14 relative rounded-3xl p-px"
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

export default DuoPromo
