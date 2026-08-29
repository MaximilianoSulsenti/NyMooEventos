import { motion } from 'motion/react'
import Button from '../components/ui/Button'
import AnimatedIcon from '../components/AnimatedIcon'
import { InstagramIcon } from '../components/icons/BrandIcons'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { cn } from '../utils/cn'
import { CARD_REVEAL } from '../utils/motionPresets'
import { secondaryTextColor } from '../utils/color'

// Degradado clásico de Instagram, usado cuando el admin no eligió un color
// de acento propio en el editor.
const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'
const INSTAGRAM_PINK = '#d62976'

function InstagramSection({ config, styles }) {
  if (!config.instagramUrl) return null

  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const gradient = config.accentColor
    ? `linear-gradient(135deg, ${config.accentColor}, ${INSTAGRAM_PINK})`
    : INSTAGRAM_GRADIENT

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.div
        {...CARD_REVEAL}
        className={cn(
          'relative flex flex-col items-center gap-4 text-center border overflow-hidden mx-auto max-w-md px-8 py-10',
          glassBlurClass(config),
          styles.card
        )}
        style={{
          ...glassStyle(config),
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: gradient }} />

        <AnimatedIcon
          icon={InstagramIcon}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: gradient }}
          iconClassName="w-7 h-7 text-white"
        />

        {config.title && (
          <h2 className={`${titleSize} ${styles.heading}`} style={{ color: config.textColor || undefined }}>
            {config.title}
          </h2>
        )}

        <p className={`max-w-sm ${subtitleSize}`} style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.subtitle || 'Compartí tus mejores momentos y etiquetanos para que no nos perdamos ninguna foto.'}
        </p>

        <Button
          as="a"
          href={config.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          primaryColor={config.accentColor || INSTAGRAM_PINK}
        >
          <InstagramIcon className="w-4 h-4" />
          {config.buttonText || 'Ver Instagram del evento'}
        </Button>
      </motion.div>
    </section>
  )
}

export default InstagramSection
