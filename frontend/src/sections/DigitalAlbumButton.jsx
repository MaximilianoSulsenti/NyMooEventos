import { useState } from 'react'
import { motion } from 'motion/react'
import { Camera } from 'lucide-react'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'
import { CARD_REVEAL } from '../utils/motionPresets'

function DigitalAlbumButton({ event, config, appearance, styles }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'

  if (!event.activeModules?.photoCollection) return null

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <motion.div {...CARD_REVEAL}>
        <h2 className={`${titleSize} mb-2 ${styles.heading}`} style={{ color: config.textColor || undefined }}>
          {config.title || 'Álbum digital del evento'}
        </h2>
        {config.subtitle && (
          <p className={`text-white/70 mb-2 ${subtitleSize}`}>{config.subtitle}</p>
        )}
        <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto break-words">
          {config.description || 'Compartí tus fotos del evento y quedan guardadas en nuestro álbum digital.'}
        </p>

        <Button type="button" onClick={() => setIsModalOpen(true)} primaryColor={appearance.primaryColor}>
          <Camera className="w-4 h-4" />
          {config.buttonText || 'Compartir mis fotos'}
        </Button>
      </motion.div>

      {isModalOpen && (
        <UploadPhotosModal
          eventSlug={event.eventSlug}
          primaryColor={appearance.primaryColor}
          allowVideos={Boolean(event.gallerySettings?.allowVideos)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}

export default DigitalAlbumButton
