import { useLayoutEffect, useRef, useState } from 'react'
import AnnounceBar from '../components/landing/AnnounceBar'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import ServicesSection from '../components/landing/ServicesSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import BenefitsSection from '../components/landing/BenefitsSection'
import FaqSection from '../components/landing/FaqSection'
import LandingFooter from '../components/landing/LandingFooter'
import FloatingWhatsappButton from '../components/landing/FloatingWhatsappButton'
import WelcomeIntro from '../components/landing/WelcomeIntro'

// Landing de ventas pública -- vive en "/", sin ningún link visible hacia el
// login del panel interno (ver App.jsx: esa ruta quedó movida y sin enlaces).
function LandingPage() {
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Cintillo + navbar van en un bloque "fixed" propio (no "sticky") para que
  // acompañen el scroll siempre, sin depender de que ningún ancestro tenga
  // overflow/transform "limpios" -- fixed es inmune a esa clase de bugs. La
  // altura real se mide con ResizeObserver (cambia entre mobile/desktop por
  // el tamaño del logo) y se usa como padding-top del contenido para que no
  // quede tapado debajo.
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return undefined
    const updateHeight = () => {
      setHeaderHeight(el.offsetHeight)
      // Los links del navbar saltan a #servicios, #que-incluye, etc. -- sin
      // esto el navegador alinea el ancla justo con el borde superior de la
      // ventana, que ahora está tapado por el header fixed.
      document.documentElement.style.setProperty('--landing-header-h', `${el.offsetHeight}px`)
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      <WelcomeIntro />

      <div ref={headerRef} className="fixed inset-x-0 top-0 z-40">
        <AnnounceBar />
        <LandingNavbar />
      </div>

      <div style={{ paddingTop: headerHeight }}>
        <main>
          <HeroSection />
          <ServicesSection />
          <FeaturesSection />
          <BenefitsSection />
          <FaqSection />
        </main>
        <LandingFooter />
      </div>

      <FloatingWhatsappButton />
    </div>
  )
}

export default LandingPage
