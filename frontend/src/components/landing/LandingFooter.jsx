import { motion } from 'motion/react'
import { InstagramIcon, WhatsappIcon } from '../icons/BrandIcons'
import { BRAND } from '../../utils/brand'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const SOCIAL_LINKS = [
  { label: 'Instagram', url: LANDING_CONTACT.instagramUrl, icon: InstagramIcon },
  {
    label: 'WhatsApp',
    url: buildWhatsappUrl('¡Hola Nymoo! Quiero más información.', LANDING_CONTACT.whatsappNumber),
    icon: WhatsappIcon,
  },
]

function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 px-4 md:px-8 pt-14 pb-8 text-center overflow-hidden">
      <div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: BRAND.blue }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-xl font-extrabold tracking-tight"
        style={{
          backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Nymoo Eventos Digitales
      </motion.p>

      <p className="text-white/70 text-sm mt-2 max-w-sm mx-auto">Invitaciones digitales interactivas, a tu medida.</p>

      <div className="flex justify-center gap-3 mt-7">
        {SOCIAL_LINKS.map((link) => (
          <motion.a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <link.icon className="w-4 h-4" />
          </motion.a>
        ))}
      </div>

      <p className="text-white/30 text-xs mt-10 uppercase tracking-[0.15em]">
        © 2026 Nymoo Eventos Digitales. Todos los derechos reservados.
      </p>
    </footer>
  )
}

export default LandingFooter
