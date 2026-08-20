import { motion } from 'motion/react'
import { Church, PartyPopper, MapPin } from 'lucide-react'

function parseLocations(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, address, mapUrl] = line.split('|').map((part) => part?.trim())
      return { label: label || 'Ubicación', address: address || '', mapUrl: mapUrl || '' }
    })
}

function pickIcon(label = '') {
  const normalized = label.toLowerCase()
  if (normalized.includes('ceremonia') || normalized.includes('iglesia') || normalized.includes('civil')) {
    return Church
  }
  if (normalized.includes('fiesta') || normalized.includes('salon') || normalized.includes('salón') || normalized.includes('recepcion')) {
    return PartyPopper
  }
  return MapPin
}

function Location({ config, styles }) {
  const locations = parseLocations(config.locations)
  const titleSize = config.fontSizeTitle || 'text-lg'

  if (locations.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`}>Ubicación</h2>
      <div className={`grid gap-4 max-w-2xl mx-auto ${locations.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {locations.map((location, index) => {
          const Icon = pickIcon(location.label)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 border border-white/10 shadow-xl p-5 flex flex-col items-center gap-2 ${styles.card}`}
            >
              <Icon className="w-6 h-6 text-white/70" />
              <p className="font-medium">{location.label}</p>
              {location.address && <p className="text-white/60 text-sm">{location.address}</p>}
              {location.mapUrl && (
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline underline-offset-2 text-white/80 hover:text-white transition"
                >
                  Ver en Google Maps
                </a>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default Location
