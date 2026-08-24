import { motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { InstagramIcon, WhatsappIcon } from '../icons/BrandIcons'
import Button from '../ui/Button'
import { BRAND } from '../../utils/brand'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'
import { NAV_LINKS } from './LandingNavbar'

const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'

const SOCIAL_LINKS = [
  { label: 'Instagram', url: LANDING_CONTACT.instagramUrl, icon: InstagramIcon, glow: INSTAGRAM_GRADIENT },
  {
    label: 'WhatsApp',
    url: buildWhatsappUrl('¡Hola Nymoo! Quiero más información.', LANDING_CONTACT.whatsappNumber),
    icon: WhatsappIcon,
    glow: '#25D366',
  },
]

const GRADIENT_IMAGE = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`
const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero armar la invitación digital de mi evento.'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function SocialButton({ link }) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      whileHover={{ scale: 1.12, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="group relative w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 overflow-hidden shadow-lg"
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: link.glow }}
      />
      <link.icon className="relative w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
    </motion.a>
  )
}

function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 overflow-hidden">
      <motion.div
        className="absolute w-[28rem] h-[28rem] rounded-full blur-3xl opacity-[0.1] pointer-events-none"
        style={{ background: BRAND.blue, top: '-10%', left: '-8%' }}
        animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[24rem] h-[24rem] rounded-full blur-3xl opacity-[0.09] pointer-events-none"
        style={{ background: BRAND.violet, bottom: '-14%', right: '-6%' }}
        animate={{ x: [0, -20, 0], y: [0, -16, 0] }}
        transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-10 md:gap-6 text-center md:text-left">
          {/* Marca */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center md:items-start gap-4"
          >
            <div className="flex items-center gap-3">
              <img
                src="/img/ojosnymoo-icon.png"
                alt=""
                className="w-11 h-11 rounded-xl shadow-lg shrink-0"
              />
              <p
                className="text-xl font-extrabold tracking-tight"
                style={{
                  backgroundImage: GRADIENT_IMAGE,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Nymoo Eventos Digitales
              </p>
            </div>
            <p className="text-white/70 text-sm max-w-xs">
              Invitaciones digitales interactivas, a tu medida. Convertimos tu gran día en una experiencia que se
              recuerda.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => (
                <SocialButton key={link.label} link={link} />
              ))}
            </div>
          </motion.div>

          {/* Navegación */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">Navegación</p>
            <nav className="flex flex-col items-center md:items-start gap-2.5">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Empezar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center md:items-start gap-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Empezá ahora</p>
            <p className="text-white/70 text-sm max-w-xs">¿Tenés un evento en mente? Contanos la idea y armamos tu invitación.</p>
            <Button
              as="a"
              href={buildWhatsappUrl(WHATSAPP_MESSAGE, LANDING_CONTACT.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              primaryColor="#25D366"
              className="text-sm py-2.5"
            >
              <WhatsappIcon className="w-4 h-4" />
              Chatear por WhatsApp
            </Button>
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs uppercase tracking-[0.15em] text-center sm:text-left">
            © 2026 Nymoo Eventos Digitales. Todos los derechos reservados.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors"
          >
            Volver arriba
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
