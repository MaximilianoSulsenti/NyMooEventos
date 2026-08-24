import { motion } from 'motion/react'
import { Timer, Info, BookOpen, Images, MapPin, Music2, CalendarClock } from 'lucide-react'
import AnimatedIcon from '../AnimatedIcon'
import { BRAND } from '../../utils/brand'

const FEATURES = [
  { icon: Timer, label: 'Cuenta regresiva', description: 'Contador animado hasta el gran día.', color: BRAND.blue },
  { icon: Info, label: 'Detalles del evento', description: 'Fecha, hora, código de vestimenta y todo lo importante.', color: BRAND.violet },
  { icon: BookOpen, label: 'Nuestra historia', description: 'Línea de tiempo con los hitos de la pareja o del homenajeado.', color: BRAND.pink },
  { icon: Images, label: 'Galería 3D', description: 'Fotos en un carrusel tridimensional premium.', color: BRAND.orange },
  { icon: MapPin, label: 'Ubicación con mapa', description: 'Google Maps integrado para llegar sin perderse.', color: BRAND.lime },
  { icon: Music2, label: 'Playlist musical', description: 'Spotify o YouTube sonando en la invitación.', color: BRAND.blue },
  { icon: CalendarClock, label: 'Cronograma de la fiesta', description: 'Horarios de cada momento, minuto a minuto.', color: BRAND.violet },
]

function FeatureItem({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
    >
      <AnimatedIcon
        icon={feature.icon}
        iconClassName="w-6 h-6"
        delay={index * 0.06}
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: `${feature.color}22`, color: feature.color, border: `1px solid ${feature.color}40` }}
      />
      <div>
        <p className="font-semibold text-sm mb-1">{feature.label}</p>
        <p className="text-white/70 text-xs leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  )
}

function FeaturesSection() {
  return (
    <section id="que-incluye" className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Qué incluye</p>
        <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Componentes que activás cuando querés
        </h2>
        <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
          Cada invitación se arma con los módulos que necesites, todos editables desde el panel.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {FEATURES.map((feature, index) => (
          <FeatureItem key={feature.label} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
