import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import Button from '../components/ui/Button'
import { glassStyle, glassBlurClass } from '../utils/glass'

function isEmbedUrl(url = '') {
  return url.includes('google.com/maps/embed')
}

function Location({ config, appearance, styles }) {
  const locations = Array.isArray(config.locations) ? config.locations : []
  const titleSize = config.fontSizeTitle || 'text-lg'
  const primaryColor = appearance?.primaryColor

  if (locations.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        {config.title || 'Ubicación'}
      </h2>
      <div className={`grid gap-5 max-w-2xl mx-auto ${locations.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {locations.map((location, index) => {
          const Icon = resolveIcon(location.icon, location.label)
          const fontSize = location.fontSize || 'text-base'
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                'relative flex flex-col items-center gap-3 text-center border overflow-hidden px-6 py-7',
                glassBlurClass(config),
                styles.card
              )}
              style={{
                ...glassStyle(config),
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: primaryColor }} />

              <AnimatedIcon
                icon={Icon}
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${primaryColor}22`, color: primaryColor }}
                iconClassName="w-6 h-6"
              />

              {location.label && <p className={`font-semibold ${fontSize}`}>{location.label}</p>}
              {location.address && <p className="text-white/60 text-sm max-w-xs">{location.address}</p>}

              {location.mapUrl && isEmbedUrl(location.mapUrl) ? (
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-lg mt-2 contrast-[1.05] saturate-75"
                  title={location.label || `Mapa ${index + 1}`}
                />
              ) : (
                location.mapUrl && (
                  <Button
                    as="a"
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    primaryColor={primaryColor}
                    className="mt-2 px-5 py-2 text-sm"
                  >
                    Ver en Google Maps
                  </Button>
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
