import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import api from '../services/api'
import SectionRenderer from '../sections/SectionRenderer'
import GlobalBackground from '../sections/GlobalBackground'
import WelcomeScreen from '../components/WelcomeScreen'
import MusicPlayerWidget from '../components/MusicPlayerWidget'
import ScrollProgressBar from '../components/ScrollProgressBar'
import usePremiumGuest from '../hooks/usePremiumGuest'
import { getThemeStyles } from '../sections/theming'

function DigitalCard() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | not-found | error
  const [introOpen, setIntroOpen] = useState(false)
  // Invitación VIP (Nymoo VIVE): si la URL trae ?guest=<passcode>, resuelve
  // el nombre del invitado para saludarlo por su nombre en la pantalla de
  // bienvenida -- mismo hook que ya usa Hero.jsx para el pill "¡Hola, {nombre}!".
  const premiumGuest = usePremiumGuest(event)

  useEffect(() => {
    let isMounted = true

    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => {
        if (!isMounted) return
        setEvent(data)
        setIntroOpen(!data.envelopeSettings?.enabled)
        setLoadState('ready')
      })
      .catch((err) => {
        if (!isMounted) return
        setLoadState(err.response?.status === 404 ? 'not-found' : 'error')
      })

    return () => {
      isMounted = false
    }
  }, [eventSlug])

  useEffect(() => {
    document.body.style.overflow = introOpen ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [introOpen])

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Cargando invitación...
      </div>
    )
  }

  if (loadState === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        No encontramos este evento.
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Ocurrió un error al cargar la invitación.
      </div>
    )
  }

  if (!event.activeModules?.interactiveCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Esta invitación todavía no está disponible.
      </div>
    )
  }

  const appearance = event.appearance || {}
  const styles = getThemeStyles(appearance.theme, appearance.fontFamily)
  const heroConfig = event.sections?.find((s) => s.id === 'Hero')?.config || {}

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden text-white ${styles.fontClass}`}>
      <ScrollProgressBar color={appearance.primaryColor} />

      {appearance.useGlobalBackground ? (
        <GlobalBackground appearance={appearance} />
      ) : (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: appearance.backgroundColor || '#0a0a0a' }} />
      )}

      {event.envelopeSettings?.enabled && !introOpen && (
        <WelcomeScreen
          settings={event.envelopeSettings}
          appearance={appearance}
          guestName={premiumGuest?.name}
          welcomeMessage={
            // VIP (link con ?guest=<passcode>, Nymoo VIVE): usa el mismo
            // saludo ya armado para la Portada (Hero.config.vipGreeting),
            // no un mensaje aparte -- así no hay que cargarlo dos veces.
            // Sin invitado VIP: el mensaje propio de esta pantalla.
            premiumGuest
              ? (heroConfig.vipGreeting || '¡Hola, {nombre}! Están cordialmente invitados').replace(
                  '{nombre}',
                  premiumGuest.name
                )
              : event.envelopeSettings.welcomeMessage || ''
          }
          onOpen={() => setIntroOpen(true)}
        />
      )}

      {event.musicSettings?.enabled && (
        <MusicPlayerWidget
          settings={event.musicSettings}
          primaryColor={appearance.primaryColor}
          autoPlayTrigger={introOpen}
        />
      )}

      <motion.div
        initial={event.envelopeSettings?.enabled ? { opacity: 0, scale: 0.97 } : false}
        animate={introOpen ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SectionRenderer event={event} />
      </motion.div>
    </div>
  )
}

export default DigitalCard
