import { motion } from 'motion/react'
import { CARD_REVEAL } from '../utils/motionPresets'

const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'

// lucide-react sacó los íconos de marcas (Instagram incluido) de su catálogo;
// se dibuja el glifo a mano para no depender de un ícono genérico fuera de tema.
function InstagramGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function InstagramSection({ config, styles }) {
  if (!config.instagramUrl) return null
  const titleSize = config.fontSizeTitle || 'text-lg'

  return (
    <section className={`px-6 ${styles.fontClass}`}>
      <motion.a
        {...CARD_REVEAL}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={config.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center gap-3 mx-auto max-w-md px-8 py-6 rounded-3xl overflow-hidden text-center shadow-xl"
        style={{ background: INSTAGRAM_GRADIENT }}
      >
        <motion.span
          className="inline-flex shrink-0"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        >
          <InstagramGlyph className="w-7 h-7 text-white" />
        </motion.span>
        <div className="min-w-0">
          {config.title && (
            <p className={`${titleSize} font-semibold truncate text-white`} style={{ color: config.textColor || undefined }}>
              {config.title}
            </p>
          )}
          <p className="text-sm font-medium text-white/90 truncate">
            {config.buttonText || 'Ver Instagram del evento'}
          </p>
        </div>
      </motion.a>
    </section>
  )
}

export default InstagramSection
