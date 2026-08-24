import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { BRAND } from '../../utils/brand'

const NAV_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#que-incluye', label: 'Qué Incluye' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#faq', label: 'Preguntas Frecuentes' },
]

const gradientTextStyle = {
  backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

function NavLink({ href, label, onClick }) {
  // El filter de hover se anima en el MISMO elemento que tiene el
  // background-clip:text (antes estaba en un <motion.span> hijo aparte) --
  // separarlos hace que algunos navegadores promuevan ese hijo a su propia
  // capa de composición al animar `filter`, y el texto (color: transparent)
  // se renderiza sin el degradé del padre detrás: el link "desaparece"
  // apenas se lo toca con el mouse.
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ filter: 'brightness(1.35)' }}
      className="relative inline-block text-sm font-medium group py-1"
      style={gradientTextStyle}
    >
      {label}
      <span
        className="absolute left-0 -bottom-0.5 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full pointer-events-none"
        style={{ backgroundImage: gradientTextStyle.backgroundImage }}
      />
    </motion.a>
  )
}

function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-2 sm:py-2.5">
        <button type="button" onClick={scrollToTop} aria-label="Ir al inicio" className="shrink-0">
          <img src="/img/nymologo-navbar.png" alt="Nymoo Eventos Digitales" className="h-14 sm:h-16 w-auto" />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default LandingNavbar
