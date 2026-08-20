import { motion } from 'motion/react'
import { Church, PartyPopper, MapPin } from 'lucide-react'

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

function isEmbedUrl(url = '') {
  return url.includes('google.com/maps/embed')
}

function Location({ config, styles }) {
  const locations = Array.isArray(config.locations) ? config.locations : []
  const titleSize = config.fontSizeTitle || 'text-lg'

  if (locations.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        Ubicación
      </h2>
      <div className={`grid gap-4 max-w-2xl mx-auto ${locations.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {locations.map((location, index) => {
          const Icon = pickIcon(location.label)
          const fontSize = location.fontSize || 'text-base'
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
              {location.label && <p className={`font-medium ${fontSize}`}>{location.label}</p>}
              {location.address && <p className="text-white/60 text-sm">{location.address}</p>}

              {location.mapUrl && isEmbedUrl(location.mapUrl) ? (
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-lg mt-2"
                  title={location.label || `Mapa ${index + 1}`}
                />
              ) : (
                location.mapUrl && (
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline underline-offset-2 text-white/80 hover:text-white transition"
                  >
                    Ver en Google Maps
                  </a>
                )
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default Location
