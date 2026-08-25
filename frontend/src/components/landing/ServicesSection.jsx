import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, CreditCard, Layers } from 'lucide-react'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'
import { shadeColor } from '../../utils/color'
import { BRAND } from '../../utils/brand'
import { LANDING_PACKS } from '../../utils/landingConfig'
import { PACK_VISUALS } from './PackVisuals'
import DuoPromo from './DuoPromo'

const BRAND_GRADIENT = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`
const GOLD_GRADIENT = 'linear-gradient(90deg, #F2C94C, #F2994A, #F2C94C)'
const BADGE_GRADIENTS = { brand: BRAND_GRADIENT, gold: GOLD_GRADIENT }
const BADGE_GLOW = { brand: `${BRAND.violet}80`, gold: '#F2994A80' }

function PackCard({ pack, index }) {
  const light = shadeColor(pack.accentColor, 20)
  const highlightGradient = pack.badge ? BADGE_GRADIENTS[pack.badge.tone] : null
  const borderGradient = highlightGradient || `linear-gradient(160deg, ${light}80, transparent 45%, ${pack.accentColor}30)`
  const Visual = PACK_VISUALS[pack.id]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      className={cn('relative rounded-3xl p-px', pack.badge && 'lg:-translate-y-3')}
      style={{ background: borderGradient, boxShadow: pack.badge ? `0 20px 45px -20px ${BADGE_GLOW[pack.badge.tone]}` : undefined }}
    >
      {pack.badge && (
        <motion.div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-white shadow-lg whitespace-nowrap"
          style={{ backgroundImage: highlightGradient, backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {pack.badge.emoji} {pack.badge.label}
        </motion.div>
      )}

      <div className="h-full rounded-[calc(1.5rem-1px)] bg-neutral-950/80 backdrop-blur-xl border border-white/5 p-6 md:p-7 flex flex-col">
        {pack.banner && (
          <div
            className="mb-5 px-3.5 py-3 rounded-xl text-xs leading-relaxed text-center"
            style={{ background: `${pack.accentColor}18`, color: shadeColor(pack.accentColor, 25), border: `1px solid ${pack.accentColor}35` }}
          >
            {pack.banner}
          </div>
        )}

        <div
          className="h-52 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden shrink-0"
          style={{ background: `linear-gradient(135deg, ${pack.accentColor}33, transparent)` }}
        >
          <div
            className="absolute w-48 h-48 rounded-full blur-2xl opacity-40"
            style={{ background: pack.accentColor }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {Visual && <Visual color={pack.accentColor} />}
          </div>
        </div>

        <h3 className="text-lg font-bold mb-1.5">{pack.name}</h3>
        <p className="text-white/70 text-sm mb-4">{pack.tagline}</p>
        <p className="text-3xl font-extrabold" style={{ color: pack.accentColor }}>
          {pack.price}
        </p>
        <p className="text-white/50 text-[11px] mt-1.5 mb-5 leading-snug">{pack.paymentNote}</p>

        <ul className="space-y-2.5 mb-7 flex-1">
          {pack.includesFrom && (
            <li className="flex items-start gap-2.5 text-sm font-semibold" style={{ color: pack.accentColor }}>
              <Layers className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="min-w-0">Todo lo incluido en {pack.includesFrom}</span>
            </li>
          )}
          {pack.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: pack.accentColor }} />
              <span className="min-w-0">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Un solo botón, bien protagonista -- lleva al checkout propio,
            donde el pedido queda guardado en MongoDB y, si hay credenciales
            reales de Mercado Pago configuradas, redirige a la pasarela; si
            no, cae a WhatsApp con el pedido ya cargado (ver Checkout.jsx /
            orderController.js). */}
        <Button as={Link} to={`/checkout?pack=${pack.id}`} primaryColor={pack.accentColor} className="w-full py-3.5 shadow-lg">
          <span className="flex flex-col items-center leading-tight text-center">
            <span className="flex items-center gap-2 text-sm font-bold">
              <CreditCard className="w-4 h-4" />
              Comprar por WhatsApp o Mercado Pago
            </span>
            {/* Aclaración a propósito: las cuotas las financia el banco del
                cliente, no Nymoo -- por eso el texto lo dice explícito y no
                promete "sin interés". Tipografía chica y liviana a propósito,
                que quede como aclaración legal discreta, no como promesa. */}
            <span className="text-[10px] font-normal tracking-wide opacity-55 italic">
              En 3 cuotas con tarjetas bancarias
            </span>
          </span>
        </Button>
      </div>
    </motion.div>
  )
}

function ServicesSection() {
  return (
    <section id="servicios" className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Nuestros packs</p>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Elegí el pack a la medida de tu evento
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {LANDING_PACKS.map((pack, index) => (
          <PackCard key={pack.id} pack={pack} index={index} />
        ))}
      </div>

      <DuoPromo />
    </section>
  )
}

export default ServicesSection
