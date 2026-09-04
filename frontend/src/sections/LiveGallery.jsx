import { useState } from 'react'
import { motion } from 'motion/react'
import { Camera } from 'lucide-react'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'
import ModulePreviewModal from '../components/ModulePreviewModal'
import { CARD_REVEAL } from '../utils/motionPresets'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

const PREVIEW_PARAGRAPHS = [
  'Acá vas a poder ver en tiempo real, proyectadas en la pantalla del salón, las fotos y videos que vayan subiendo tus invitados durante la fiesta.',
  'Cada momento que compartan se va sumando al instante, para que todos disfruten juntos de cada recuerdo mientras está pasando.',
  '¡Una forma única de vivir la fiesta, todos conectados al mismo momento!',
]

// Misma estructura que DigitalAlbumButton.jsx a propósito -- la única
// diferencia real entre los dos módulos es que acá las fotos también se
// proyectan en la pantalla del salón el día del evento, no solo quedan
// guardadas. Antes esta sección mostraba una previa de las últimas fotos
// subidas (miniaturas), pero el <video> usaba una URL de imagen como src
// (cloudinaryThumb no genera un video real), lo que rompía el thumbnail de
// cualquier video -- se saca esa previa entera, igual que el álbum por QR
// nunca la tuvo.
function LiveGallery({ event, config, appearance, styles }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const moduleActive = Boolean(event.activeModules?.liveGallery)

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <motion.div {...CARD_REVEAL}>
        <h2 className={`${titleSize} mb-2 ${styles.heading}`} style={titleTextStyle(config)}>
          {config.title || 'Galería en vivo'}
        </h2>
        {config.subtitle && (
          <p className={`mb-2 ${subtitleSize}`} style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
            {config.subtitle}
          </p>
        )}
        <p className="text-sm mb-6 max-w-sm mx-auto break-words" style={{ color: secondaryTextColor(config.textColor, '99') }}>
          {config.description || 'Compartí tus fotos del evento y miralas en vivo en la pantalla del salón el día de la fiesta.'}
        </p>

        <Button
          type="button"
          onClick={() => (moduleActive ? setIsModalOpen(true) : setShowPreview(true))}
          primaryColor={appearance.primaryColor}
        >
          <Camera className="w-4 h-4" />
          {config.buttonText || 'Subir fotos'}
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
      {showPreview && (
        <ModulePreviewModal
          title="Galería en vivo"
          paragraphs={PREVIEW_PARAGRAPHS}
          primaryColor={appearance.primaryColor}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  )
}

export default LiveGallery
