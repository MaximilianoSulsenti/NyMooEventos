import { motion } from 'motion/react'
import {
  MailOpen,
  Timer,
  CalendarDays,
  BookOpen,
  Images,
  Landmark,
  MapPin,
  ClipboardCheck,
  Ticket,
  QrCode,
  Music2,
  Volume2,
  CalendarClock,
  Gift,
  Info,
} from 'lucide-react'
import AnimatedIcon from '../AnimatedIcon'
import { InstagramIcon } from '../icons/BrandIcons'
import { BRAND } from '../../utils/brand'

// Catálogo real de módulos de la plataforma -- según el plan que compre cada
// cliente, nosotros (el admin) activamos los que correspondan desde el
// panel. No es autoservicio: esta grilla es una vidriera de lo que existe,
// no un selector para el visitante.
const FEATURES = [
  { icon: MailOpen, label: 'Sobre de bienvenida', description: 'Una animación de sobre que se abre con tu mensaje antes de mostrar la invitación.', color: BRAND.pink },
  { icon: Timer, label: 'Cuenta regresiva', description: 'Contador animado hasta el gran día.', color: BRAND.blue },
  { icon: CalendarDays, label: 'Detalles del evento', description: 'Fecha, hora, ceremonia, código de vestimenta y todo lo importante.', color: BRAND.violet },
  { icon: BookOpen, label: 'Nuestra historia', description: 'Línea de tiempo con los hitos de la pareja o del homenajeado.', color: BRAND.orange },
  { icon: Images, label: 'Galería 3D', description: 'Fotos en un carrusel tridimensional premium.', color: BRAND.lime },
  { icon: Landmark, label: 'Fotos del salón o la iglesia', description: 'Un carrusel para mostrar el lugar antes de llegar.', color: BRAND.blue },
  { icon: MapPin, label: 'Ubicación con mapa', description: 'Google Maps integrado para llegar sin perderse.', color: BRAND.violet },
  { icon: ClipboardCheck, label: 'Confirmación de asistencia', description: 'Por WhatsApp directo, o un formulario con estadísticas de invitados en vivo.', color: BRAND.pink },
  { icon: Ticket, label: 'Invitaciones VIP personalizadas', description: 'Pase individual con cupo de acompañantes para cada invitado especial.', color: BRAND.orange },
  { icon: QrCode, label: 'Álbum colaborativo por QR', description: 'Los invitados suben sus fotos escaneando un código, con álbum descargable.', color: BRAND.lime },
  { icon: Music2, label: 'Playlist colaborativa', description: 'Tu playlist de Spotify o YouTube, más un formulario para que sugieran canciones.', color: BRAND.blue },
  { icon: Volume2, label: 'Música ambiente', description: 'Un tema de fondo sonando apenas se abre la invitación.', color: BRAND.violet },
  { icon: CalendarClock, label: 'Cronograma de la fiesta', description: 'Horarios de cada momento, minuto a minuto.', color: BRAND.pink },
  { icon: Gift, label: 'Lista de regalos o colecta', description: 'Alias o CBU para que los invitados puedan colaborar.', color: BRAND.orange },
  { icon: InstagramIcon, label: 'Instagram del evento', description: 'Conectá la red social oficial de tu celebración para que todos sigan el minuto a minuto del gran día en un clic.', color: BRAND.lime },
  { icon: Info, label: 'Información adicional', description: 'Traslados, hospedaje, estacionamiento o lo que necesites aclarar.', color: BRAND.blue },
]

function FeatureItem({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -4, borderColor: `${feature.color}55` }}
      className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
    >
      <AnimatedIcon
        icon={feature.icon}
        iconClassName="w-6 h-6"
        delay={index * 0.04}
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
        <p className="uppercase tracking-[0.3em] text-xs mb-3 text-white/40">Qué incluyen</p>
        <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Todo lo que tu invitación puede tener
        </h2>
        <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
          Según el plan que elijas, nosotros activamos los módulos que tu evento necesita.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {FEATURES.map((feature, index) => (
          <FeatureItem key={feature.label} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
