import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

function SalonCarrousel({ config, styles }) {
  const images = [config.image1, config.image2, config.image3].filter(Boolean)
  const speedMs = (config.transitionSpeed || 4) * 1000
  const titleSize = config.fontSizeTitle || 'text-lg'
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return undefined
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % images.length), speedMs)
    return () => clearInterval(interval)
  }, [images.length, speedMs])

  if (images.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      {config.title && (
        <h2 className={`${titleSize} mb-1 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
          {config.title}
        </h2>
      )}
      {config.subtitle && <p className="text-white/60 text-sm mb-4">{config.subtitle}</p>}

      <div className="relative max-w-md mx-auto h-72 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index]}
            src={images[index]}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {config.caption && <p className="text-white/50 text-sm mt-3 italic">{config.caption}</p>}
    </section>
  )
}

export default SalonCarrousel
