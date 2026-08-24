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

const GRADIENT_IMAGE = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.violet}, ${BRAND.pink})`

// index solo se pasa en el menú móvil -- habilita la entrada escalonada
// (stagger) de arriba hacia abajo apenas se abre; en desktop el link ya
// está en pantalla desde el primer render, así que no necesita animación
// de entrada.
function NavLink({ href, label, onClick, index }) {
  const hasEntrance = typeof index === 'number'

  // El filter de hover se anima en el MISMO elemento que tiene el degradé
  // (antes estaba en un <motion.span> hijo aparte) -- separarlos hace que
  // algunos navegadores promuevan ese hijo a su propia capa de composición
  // al animar `filter`, y el texto (transparent) se renderiza sin el
  // degradé del padre detrás: el link "desaparece" apenas se lo toca.
  //
  // bg-clip-text/text-transparent van como clases (no inline style) para
  // que el navegador las resuelva igual que cualquier otra utilidad de
  // Tailwind, y transform-gpu fuerza una capa de composición propia desde
  // el primer render -- en el menú móvil este link nace dentro de un
  // contenedor que anima su `height` (0 -> auto), y algunos WebKit
  // (iOS Safari) no repintan bien un `background-clip: text` que aparece
  // en medio de esa animación si no tiene ya su propia capa.
  return (
    <motion.a
      href={href}
      onClick={onClick}
      initial={hasEntrance ? { opacity: 0, y: -8 } : false}
      animate={hasEntrance ? { opacity: 1, y: 0 } : undefined}
      transition={hasEntrance ? { delay: index * 0.07, duration: 0.3, ease: 'easeOut' } : undefined}
      whileHover={{ filter: 'brightness(1.35)', transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block transform-gpu bg-clip-text text-transparent text-sm font-medium group py-1"
      style={{ backgroundImage: GRADIENT_IMAGE }}
    >
      {label}
      <span
        className="absolute left-0 -bottom-0.5 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full pointer-events-none"
        style={{ backgroundImage: GRADIENT_IMAGE }}
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
              {NAV_LINKS.map((link, i) => (
                <NavLink key={link.href} {...link} index={i} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default LandingNavbar
