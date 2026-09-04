import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import CarouselArrows from '../components/ui/CarouselArrows'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

function SalonCarrousel({ config, styles }) {
  const images = [
    config.image1,
    config.image2,
    config.image3,
    ...(Array.isArray(config.images) ? config.images : []),
  ].filter(Boolean)
  const speedMs = (config.transitionSpeed || 4) * 1000
  const titleSize = config.fontSizeTitle || 'text-lg'
  const [index, setIndex] = useState(0)
  const [manualNav, setManualNav] = useState(0)

  useEffect(() => {
    if (images.length < 2) return undefined
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % images.length), speedMs)
    return () => clearInterval(interval)
  }, [images.length, speedMs, manualNav])

  function goTo(direction) {
    setIndex((prev) => (prev + direction + images.length) % images.length)
    setManualNav((n) => n + 1)
  }

  if (images.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      {config.title && (
        <h2 className={`${titleSize} mb-1 ${styles.heading}`} style={titleTextStyle(config)}>
          {config.title}
        </h2>
      )}
      {config.subtitle && (
        <p className="text-sm mb-4" style={{ color: secondaryTextColor(config.textColor, '99') }}>
          {config.subtitle}
        </p>
      )}

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
        {images.length > 1 && <CarouselArrows onPrev={() => goTo(-1)} onNext={() => goTo(1)} />}
      </div>

      {config.caption && (
        <p className="text-sm mt-3 italic" style={{ color: secondaryTextColor(config.textColor, '80') }}>
          {config.caption}
        </p>
      )}
    </section>
  )
}

export default SalonCarrousel
