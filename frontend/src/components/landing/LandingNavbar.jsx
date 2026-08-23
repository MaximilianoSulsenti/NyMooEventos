import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { WhatsappIcon } from '../icons/BrandIcons'
import Button from '../ui/Button'
import { BRAND } from '../../utils/brand'
import { LANDING_CONTACT, buildWhatsappUrl } from '../../utils/landingConfig'

const NAV_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#que-incluye', label: 'Qué Incluye' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#faq', label: 'Preguntas Frecuentes' },
]

const WHATSAPP_MESSAGE = '¡Hola Nymoo! Quiero saber más sobre las invitaciones digitales.'

function NavLink({ href, label, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="relative text-sm text-white/70 hover:text-white transition-colors group py-1"
    >
      {label}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
    </a>
  )
}

function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-3.5">
        <button
          type="button"
          onClick={scrollToTop}
          className="text-lg md:text-xl font-extrabold tracking-tight"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Nymoo Eventos Digitales
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            as="a"
            href={buildWhatsappUrl(WHATSAPP_MESSAGE, LANDING_CONTACT.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            primaryColor="#25D366"
            className="px-5 py-2 text-sm"
          >
            <WhatsappIcon className="w-4 h-4" />
            Chatear
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="md:hidden text-white/80 p-1.5"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <nav className="flex flex-col gap-4 px-4 py-5">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} {...link} onClick={() => setMobileOpen(false)} />
              ))}
              <Button
                as="a"
                href={buildWhatsappUrl(WHATSAPP_MESSAGE, LANDING_CONTACT.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                primaryColor="#25D366"
                className="w-full mt-1 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                <WhatsappIcon className="w-4 h-4" />
                Chatear por WhatsApp
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default LandingNavbar
