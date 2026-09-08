import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { resolveIcon } from './eventIcons'
import AnimatedIcon from '../components/AnimatedIcon'
import Button from '../components/ui/Button'
import RsvpModalShell from '../components/RsvpModalShell'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

function isEmbedUrl(url = '') {
  return url.includes('google.com/maps/embed')
}

function Location({ config, appearance, styles }) {
  // Antes el botón navegaba directo (target="_blank") -- en el celular eso
  // saltaba de golpe a la app de Google Maps sin avisar. Ahora primero
  // abre esta confirmación chica; el link real recién vive adentro, en el
  // botón del modal.
  const [confirmLocation, setConfirmLocation] = useState(null)
  const locations = Array.isArray(config.locations) ? config.locations : []
  const titleSize = config.fontSizeTitle || 'text-lg'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const bodySize = config.fontSizeBody || 'text-sm'
  const secondaryColor = config.textColorSecondary || config.textColor
  const primaryColor = appearance?.primaryColor

  if (locations.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} ${config.subtitle ? 'mb-1' : 'mb-6'} ${styles.heading}`} style={titleTextStyle(config)}>
        {config.title || 'Ubicación'}
      </h2>
      {config.subtitle && (
        <p className={`mb-6 ${subtitleSize}`} style={{ color: secondaryTextColor(secondaryColor, 'b3') }}>
          {config.subtitle}
        </p>
      )}
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

              {location.label && (
                <p className={`font-semibold ${fontSize}`} style={{ color: config.textColor || undefined }}>
                  {location.label}
                </p>
              )}
              {location.address && (
                <p className={`${bodySize} max-w-xs`} style={{ color: secondaryTextColor(secondaryColor, '99') }}>
                  {location.address}
                </p>
              )}

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
                    type="button"
                    onClick={() => setConfirmLocation(location)}
                    primaryColor={primaryColor}
                    className="mt-2 px-5 py-2 text-sm"
                  >
                    {config.mapsButtonText || 'Ver en Google Maps'}
                  </Button>
                )
              )}
            </motion.div>
          )
        })}
      </div>

      {confirmLocation && (
        <RsvpModalShell accentColor={primaryColor} onClose={() => setConfirmLocation(null)}>
          <div className="text-center">
            <AnimatedIcon
              icon={resolveIcon(confirmLocation.icon, confirmLocation.label)}
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${primaryColor}22`, color: primaryColor }}
              iconClassName="w-6 h-6"
            />
            {confirmLocation.label && <p className="font-semibold text-lg mb-1">{confirmLocation.label}</p>}
            {confirmLocation.address && <p className="text-sm text-white/70 mb-5">{confirmLocation.address}</p>}
            <Button
              as="a"
              href={confirmLocation.mapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setConfirmLocation(null)}
              primaryColor={primaryColor}
              className="w-full px-5 py-2.5 text-sm"
            >
              {config.mapsButtonText || 'Ver en Google Maps'}
            </Button>
          </div>
        </RsvpModalShell>
      )}
    </section>
  )
}

export default Location
