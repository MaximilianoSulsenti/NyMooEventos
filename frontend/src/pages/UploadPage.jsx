import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, Sparkles } from 'lucide-react'
import api from '../services/api'
import UploadPhotosForm from '../components/UploadPhotosForm'
import PageBackground from '../components/PageBackground'
import BrandLogos from '../components/BrandLogos'
import GlassPanel from '../components/ui/GlassPanel'
import { getThemeStyles } from '../sections/theming'

function UploadPage() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => setEvent(data))
      .catch(() => {})
  }, [eventSlug])

  const styles = getThemeStyles(event?.uploadPageSettings?.theme)
  const primaryColor = event?.appearance?.primaryColor || '#a855f7'
  // Antes se mostraba siempre el formulario y recién al tocar "Subir" caía
  // un 403 con un mensaje interno ("El módulo de galería no está activo
  // para este evento"). Si ya sabemos que el módulo está apagado, mejor
  // mostrar esto directo en vez de dejar que el invitado llegue a ese error.
  const moduleActive = !event || Boolean(event.activeModules?.liveGallery || event.activeModules?.photoCollection)

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center gap-4 px-4 sm:px-6 py-10 ${styles.fontClass}`}>
      <PageBackground settings={event?.uploadPageSettings} />
      {event && <BrandLogos branding={event.brandingSettings} />}

      <GlassPanel accentColor={primaryColor} className="w-full max-w-md px-6 py-9 sm:px-9 sm:py-10">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
            style={{ background: `${primaryColor}22`, color: primaryColor }}
          >
            {moduleActive ? <Camera className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-white break-words">
            {moduleActive ? 'Subí tus fotos del evento' : 'Álbum del evento'}
          </h1>
          <p className="text-white/50 text-sm max-w-xs">
            {moduleActive
              ? 'Van a aparecer en la pantalla en vivo para que todos las vean.'
              : 'Todavía no está activo, pero se habilita solo el día del evento -- ¡no tenés que hacer nada!'}
          </p>
        </div>

        {moduleActive && (
          <UploadPhotosForm
            eventSlug={eventSlug}
            primaryColor={primaryColor}
            allowVideos={Boolean(event?.gallerySettings?.allowVideos)}
          />
        )}
      </GlassPanel>
    </div>
  )
}

export default UploadPage
