import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import ThreeDPhotoCarousel from '../components/ui/ThreeDPhotoCarousel'

function BentoGrid({ images }) {
  const spanClasses = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
  ]

  return (
    <div className="grid grid-cols-3 auto-rows-[90px] gap-2 max-w-2xl mx-auto">
      {images.map((src, index) => (
        <motion.img
          key={src + index}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.03 }}
          transition={{ delay: (index % 6) * 0.05 }}
          src={src}
          alt=""
          className={`w-full h-full object-cover rounded-lg ${spanClasses[index % spanClasses.length]}`}
        />
      ))}
    </div>
  )
}

function ClassicCarousel({ images }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return undefined
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 4000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
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
  )
}

function Gallery({ config, styles }) {
  const images = Array.isArray(config.images) ? config.images : []
  const titleSize = config.fontSizeTitle || 'text-2xl'

  if (images.length === 0) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        {config.title || 'Galería'}
      </h2>

      {config.layout === 'carousel3d' && <ThreeDPhotoCarousel images={images} />}
      {config.layout === 'carousel' && <ClassicCarousel images={images} />}
      {(!config.layout || config.layout === 'bento') && <BentoGrid images={images} />}
    </section>
  )
}

export default Gallery
