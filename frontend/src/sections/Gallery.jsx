import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import api from '../services/api'

function BentoGrid({ photos }) {
  const spanClasses = ['col-span-2 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-2', 'col-span-2 row-span-1', 'col-span-1 row-span-1']

  return (
    <div className="grid grid-cols-3 auto-rows-[90px] gap-2 max-w-2xl mx-auto">
      {photos.slice(0, 6).map((photo, index) => (
        <motion.img
          key={photo._id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          src={photo.cloudinaryUrl}
          alt=""
          className={`w-full h-full object-cover rounded-lg ${spanClasses[index % spanClasses.length]}`}
        />
      ))}
    </div>
  )
}

function Carousel3D({ photos }) {
  const [active, setActive] = useState(0)
  const visible = photos.slice(0, 5)

  return (
    <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto h-64">
      {visible.map((photo, index) => {
        const offset = index - active
        const isActive = offset === 0
        return (
          <motion.img
            key={photo._id}
            src={photo.cloudinaryUrl}
            alt=""
            onClick={() => setActive(index)}
            animate={{
              scale: isActive ? 1 : 0.75,
              rotateY: offset * 25,
              opacity: Math.abs(offset) > 2 ? 0 : 1,
              zIndex: 10 - Math.abs(offset),
            }}
            className="w-40 h-56 object-cover rounded-xl shrink-0 cursor-pointer shadow-xl"
            style={{ transformStyle: 'preserve-3d' }}
          />
        )
      })}
    </div>
  )
}

function Gallery({ event, config, appearance, styles }) {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (!event.activeModules?.liveGallery) return
    api
      .get(`/photos/slug/${event.eventSlug}`)
      .then(({ data }) => setPhotos(data))
      .catch(() => {})
  }, [event.eventSlug, event.activeModules?.liveGallery])

  if (!event.activeModules?.liveGallery) return null

  const titleSize = config.fontSizeTitle || 'text-2xl'

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-6 ${styles.heading}`}>{config.title || 'Galería'}</h2>

      {photos.length > 0 &&
        (config.layout === 'carousel' ? <Carousel3D photos={photos} /> : <BentoGrid photos={photos} />)}

      <p className="text-white/70 mt-6 mb-4">Compartí tus fotos del evento y miralas en la pantalla del salón.</p>
      <Link
        to={`/evento/${event.eventSlug}/upload`}
        className={`inline-block px-6 py-3 ${styles.card} font-medium`}
        style={{ background: appearance.primaryColor, color: '#0a0a0a' }}
      >
        Subir fotos
      </Link>
    </section>
  )
}

export default Gallery
