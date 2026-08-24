import { motion } from 'motion/react'
import { Check, CreditCard, Layers } from 'lucide-react'
import { WhatsappIcon } from '../icons/BrandIcons'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'
import { shadeColor } from '../../utils/color'
import { BRAND } from '../../utils/brand'
import { LANDING_CONTACT, LANDING_PACKS, buildWhatsappUrl } from '../../utils/landingConfig'
import { PACK_VISUALS } from './PackVisuals'

const BRAND_GRADIENT = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`

function PackCard({ pack, index }) {
  const light = shadeColor(pack.accentColor, 20)
  const borderGradient = pack.recommended
    ? BRAND_GRADIENT
    : `linear-gradient(160deg, ${light}80, transparent 45%, ${pack.accentColor}30)`
  const Visual = PACK_VISUALS[pack.id]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      className={cn('relative rounded-3xl p-px', pack.recommended && 'lg:-translate-y-3')}
      style={{ background: borderGradient, boxShadow: pack.recommended ? `0 20px 45px -20px ${BRAND.violet}80` : undefined }}
    >
      {pack.recommended && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-white shadow-lg whitespace-nowrap"
          style={{ backgroundImage: BRAND_GRADIENT }}
        >
          ⭐ El más elegido
        </div>
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
          className="h-28 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden shrink-0"
          style={{ background: `linear-gradient(135deg, ${pack.accentColor}33, transparent)` }}
        >
          <div
            className="absolute w-40 h-40 rounded-full blur-2xl opacity-40"
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

        <div className="flex flex-col gap-2.5">
          {/* Todavía no hay links reales de Mercado Pago Checkout Pro -- este
              botón redirige a WhatsApp con el pack pre-cargado hasta tenerlos;
              cuando existan, cambiar el href por el link de pago del pack. */}
          <Button
            as="a"
            href={buildWhatsappUrl(
              `¡Hola Nymoo! Quiero pagar el paquete ${pack.name} (${pack.price}), ¿me pasás el link de Mercado Pago?`,
              LANDING_CONTACT.whatsappNumber
            )}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5"
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="w-4 h-4" />
                Comprar con Mercado Pago
              </span>
              <span className="text-[11px] font-normal text-white/60">Hasta 3 cuotas con Mercado Pago</span>
            </span>
          </Button>
          <Button
            as="a"
            href={buildWhatsappUrl(pack.whatsappMessage, LANDING_CONTACT.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            primaryColor="#25D366"
            className="w-full text-sm py-2.5"
          >
            <WhatsappIcon className="w-4 h-4" />
            Consultar por WhatsApp
          </Button>
        </div>
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
    </section>
  )
}

export default ServicesSection
