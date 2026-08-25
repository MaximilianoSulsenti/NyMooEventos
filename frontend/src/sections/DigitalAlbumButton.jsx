import { useState } from 'react'
import { motion } from 'motion/react'
import { Camera } from 'lucide-react'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'
import ModulePreviewModal from '../components/ModulePreviewModal'
import { CARD_REVEAL } from '../utils/motionPresets'

const PREVIEW_PARAGRAPHS = [
  'En este espacio van a poder revivir los momentos más especiales del evento a través de las fotos que suban los invitados.',
  'El día de la fiesta vas a tener un código QR para escanear en la pantalla del salón, para que todos puedan acceder fácilmente y subir sus fotos.',
  'Así, cada sonrisa, cada abrazo y cada detalle queda guardado para siempre. ¡Un recuerdo único hecho entre todos!',
]

function DigitalAlbumButton({ event, config, appearance, styles }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const titleSize = config.fontSizeTitle || 'text-2xl'
  const subtitleSize = config.fontSizeSubtitle || 'text-base'
  const moduleActive = Boolean(event.activeModules?.photoCollection)

  // Antes esta sección se ocultaba entera (return null) si el módulo no
  // estaba activo, aunque el organizador la hubiera dejado habilitada en
  // el editor. Ahora se ve siempre, y al tocar el botón muestra el flujo
  // real (si el módulo está pago) o un preview explicando la función (si
  // no) en vez de un error interno cuando falla la subida.
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

        <Button
          type="button"
          onClick={() => (moduleActive ? setIsModalOpen(true) : setShowPreview(true))}
          primaryColor={appearance.primaryColor}
        >
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
      {showPreview && (
        <ModulePreviewModal
          title="Álbum digital por QR"
          paragraphs={PREVIEW_PARAGRAPHS}
          primaryColor={appearance.primaryColor}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  )
}

export default DigitalAlbumButton
