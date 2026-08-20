import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import api from '../services/api'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'

function LiveGallery({ event, config, appearance, styles }) {
  const [photos, setPhotos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const titleSize = config.fontSizeTitle || 'text-2xl'

  useEffect(() => {
    if (!event.activeModules?.liveGallery) return
    api
      .get(`/photos/slug/${event.eventSlug}`)
      .then(({ data }) => setPhotos(data))
      .catch(() => {})
  }, [event.eventSlug, event.activeModules?.liveGallery])

  if (!event.activeModules?.liveGallery) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-3 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        {config.title || 'Galería en vivo'}
      </h2>
      <p className="text-white/70 mb-6">Compartí tus fotos del evento y miralas en la pantalla del salón.</p>

      {photos.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap max-w-md mx-auto mb-6">
          {photos.slice(0, 6).map((photo) => (
            <motion.img
              key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              src={photo.cloudinaryUrl}
              alt=""
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <Button type="button" onClick={() => setIsModalOpen(true)} primaryColor={appearance.primaryColor}>
        Subir fotos
      </Button>

      {isModalOpen && (
        <UploadPhotosModal
          eventSlug={event.eventSlug}
          primaryColor={appearance.primaryColor}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}

export default LiveGallery
