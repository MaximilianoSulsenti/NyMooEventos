import { motion } from 'motion/react'
import { Check, CreditCard } from 'lucide-react'
import { WhatsappIcon } from '../icons/BrandIcons'
import Button from '../ui/Button'
import { shadeColor } from '../../utils/color'
import { LANDING_CONTACT, LANDING_PACKS, buildWhatsappUrl } from '../../utils/landingConfig'

function PackCard({ pack, index }) {
  const light = shadeColor(pack.accentColor, 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-3xl p-px"
      style={{ background: `linear-gradient(160deg, ${light}80, transparent 45%, ${pack.accentColor}30)` }}
    >
      <div className="h-full rounded-[calc(1.5rem-1px)] bg-neutral-950/80 backdrop-blur-xl border border-white/5 p-6 md:p-7 flex flex-col">
        <div
          className="h-32 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${pack.accentColor}33, transparent)` }}
        >
          <div
            className="absolute w-40 h-40 rounded-full blur-2xl opacity-40"
            style={{ background: pack.accentColor }}
          />
          <span className="relative text-4xl font-black tracking-tight" style={{ color: pack.accentColor }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-1.5">{pack.name}</h3>
        <p className="text-white/70 text-sm mb-4">{pack.tagline}</p>
        <p className="text-3xl font-extrabold mb-5" style={{ color: pack.accentColor }}>
          {pack.price}
        </p>

        <ul className="space-y-2.5 mb-7 flex-1">
          {pack.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: pack.accentColor }} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2.5">
          <Button
            as="a"
            href={buildWhatsappUrl(
              `¡Hola Nymoo! Quiero contratar el ${pack.name} para mi evento.`,
              LANDING_CONTACT.whatsappNumber
            )}
            target="_blank"
            rel="noreferrer"
            primaryColor="#25D366"
            className="w-full text-sm py-2.5"
          >
            <WhatsappIcon className="w-4 h-4" />
            Consultar por WhatsApp
          </Button>
          {/* Todavía no hay links reales de Mercado Pago Checkout Pro -- este
              botón redirige a WhatsApp con el pack pre-cargado hasta tenerlos;
              cuando existan, cambiar el href por el link de pago del pack. */}
          <Button
            as="a"
            href={buildWhatsappUrl(
              `¡Hola Nymoo! Quiero pagar el ${pack.name}, ¿me pasás el link de Mercado Pago?`,
              LANDING_CONTACT.whatsappNumber
            )}
            target="_blank"
            rel="noreferrer"
            className="w-full text-sm py-2.5"
          >
            <CreditCard className="w-4 h-4" />
            Comprar con Mercado Pago
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {LANDING_PACKS.map((pack, index) => (
          <PackCard key={pack.id} pack={pack} index={index} />
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
