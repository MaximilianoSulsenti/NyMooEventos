import { motion } from 'motion/react'
import { Share2, Send, Zap, Wallet, Settings2, Palette } from 'lucide-react'
import { BRAND } from '../../utils/brand'

const BENEFITS = [
  { icon: Share2, title: 'Fácil de compartir', description: 'Un solo link que se manda por WhatsApp, mail o redes.' },
  { icon: Send, title: 'Envíos ilimitados', description: 'Compartila con todos los invitados que necesites, sin límite.' },
  { icon: Zap, title: 'Rápidas', description: 'Lista en menos de 3 días, sin vueltas ni imprentas.' },
  { icon: Wallet, title: 'Económicas', description: 'Sin costos de impresión ni envío físico.' },
  { icon: Settings2, title: 'Funcionales', description: 'RSVP, galería, ubicación y música, todo en un solo lugar.' },
  { icon: Palette, title: '100% Personalizadas', description: 'Colores, tipografías y temas a tu gusto.' },
]

function BenefitCard({ benefit, index }) {
  const Icon = benefit.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${BRAND.blue}22`, color: BRAND.blue, border: `1px solid ${BRAND.blue}40` }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-sm mb-1">{benefit.title}</p>
        <p className="text-white/50 text-xs leading-relaxed">{benefit.description}</p>
      </div>
    </motion.div>
  )
}

function BenefitsSection() {
  return (
    <section id="beneficios" className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Beneficios</p>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Por qué elegir una invitación Nymoo
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {BENEFITS.map((benefit, index) => (
          <BenefitCard key={benefit.title} benefit={benefit} index={index} />
        ))}
      </div>
    </section>
  )
}

export default BenefitsSection
