import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import api from '../services/api'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'
import ModulePreviewModal from '../components/ModulePreviewModal'
import { cloudinaryThumb } from '../utils/cloudinary'

const PREVIEW_PARAGRAPHS = [
  'Acá vas a poder ver en tiempo real, proyectadas en la pantalla del salón, las fotos y videos que vayan subiendo tus invitados durante la fiesta.',
  'Cada momento que compartan se va sumando al instante, para que todos disfruten juntos de cada recuerdo mientras está pasando.',
  '¡Una forma única de vivir la fiesta, todos conectados al mismo momento!',
]

function LiveGallery({ event, config, appearance, styles }) {
  const [photos, setPhotos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const moduleActive = Boolean(event.activeModules?.liveGallery)

  useEffect(() => {
    if (!moduleActive) return
    api
      .get(`/photos/slug/${event.eventSlug}`)
      .then(({ data }) => setPhotos(data))
      .catch(() => {})
  }, [event.eventSlug, moduleActive])

  // Antes esta sección se ocultaba entera (return null) si el módulo no
  // estaba activo, aunque el organizador la hubiera dejado habilitada en
  // el editor. Ahora se ve siempre, y al tocar el botón muestra el flujo
  // real (si el módulo está pago) o un preview explicando la función.
  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`${titleSize} mb-3 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
        {config.title || 'Galería en vivo'}
      </h2>
      <p className="text-white/70 mb-6">Compartí tus fotos del evento y miralas en la pantalla del salón.</p>

      {photos.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap max-w-md mx-auto mb-6">
          {photos.slice(0, 6).map((photo) =>
            photo.assetType === 'video' ? (
              <motion.video
                key={photo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src={cloudinaryThumb(photo.cloudinaryUrl, 120)}
                muted
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <motion.img
                key={photo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src={cloudinaryThumb(photo.cloudinaryUrl, 120)}
                alt=""
                className="w-16 h-16 object-cover rounded-lg"
              />
            )
          )}
        </div>
      )}

      <Button
        type="button"
        onClick={() => (moduleActive ? setIsModalOpen(true) : setShowPreview(true))}
        primaryColor={appearance.primaryColor}
      >
        Subir fotos
      </Button>

      {isModalOpen && (
        <UploadPhotosModal
          eventSlug={event.eventSlug}
          primaryColor={appearance.primaryColor}
          allowVideos={Boolean(event.gallerySettings?.allowVideos)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {showPreview && (
        <ModulePreviewModal
          title="Galería en vivo"
          paragraphs={PREVIEW_PARAGRAPHS}
          primaryColor={appearance.primaryColor}
          eventName={event.eventName}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  )
}

export default LiveGallery
