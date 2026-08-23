import AnnounceBar from '../components/landing/AnnounceBar'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import ServicesSection from '../components/landing/ServicesSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import BenefitsSection from '../components/landing/BenefitsSection'
import FaqSection from '../components/landing/FaqSection'
import LandingFooter from '../components/landing/LandingFooter'

// Landing de ventas pública -- vive en "/", sin ningún link visible hacia el
// login del panel interno (ver App.jsx: esa ruta quedó movida y sin enlaces).
function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-950 text-white">
      <AnnounceBar />
      <LandingNavbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <BenefitsSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingPage
