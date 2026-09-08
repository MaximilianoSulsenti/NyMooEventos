import { useState } from 'react'
import { motion } from 'motion/react'
import { Camera } from 'lucide-react'
import Button from '../components/ui/Button'
import UploadPhotosModal from '../components/UploadPhotosModal'
import ModulePreviewModal from '../components/ModulePreviewModal'
import { CARD_REVEAL } from '../utils/motionPresets'
import { cn } from '../utils/cn'
import { secondaryTextColor, titleTextStyle, secondaryGlassStyle } from '../utils/color'

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
  const bodySize = config.fontSizeBody || 'text-sm'
  const secondaryColor = config.textColorSecondary || config.textColor
  const glassBg = config.textGlassBg === 'si'
  const glassBgStyle = glassBg ? secondaryGlassStyle(secondaryColor) : null
  const moduleActive = Boolean(event.activeModules?.photoCollection)

  // Antes esta sección se ocultaba entera (return null) si el módulo no
  // estaba activo, aunque el organizador la hubiera dejado habilitada en
  // el editor. Ahora se ve siempre, y al tocar el botón muestra el flujo
  // real (si el módulo está pago) o un preview explicando la función (si
  // no) en vez de un error interno cuando falla la subida.
  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <motion.div {...CARD_REVEAL}>
        <h2 className={`${titleSize} mb-2 ${styles.heading}`} style={titleTextStyle(config)}>
          {config.title || 'Álbum digital del evento'}
        </h2>
        {config.subtitle && (
          <p
            className={cn('mb-2', subtitleSize, glassBg && 'inline-block backdrop-blur-md rounded-2xl px-4 py-1.5')}
            style={{ color: secondaryTextColor(secondaryColor, 'b3'), ...glassBgStyle }}
          >
            {config.subtitle}
          </p>
        )}
        <p
          className={cn(bodySize, 'mb-6 max-w-sm mx-auto break-words', glassBg && 'inline-block backdrop-blur-md rounded-2xl px-4 py-1.5')}
          style={{ color: secondaryTextColor(secondaryColor, '99'), ...glassBgStyle }}
        >
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
