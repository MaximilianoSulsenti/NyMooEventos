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
  // Si no hay sobre de bienvenida, la música (cuando está activada) se
  // comporta como siempre: intenta arrancar sola apenas carga la tarjeta
  // (ver más abajo, se inicializa en true junto con introOpen). Con sobre
  // de bienvenida, arranca en false y la decide el invitado con los
  // botones "Ingresar con/sin música" (ver WelcomeScreen).
  const [musicConsent, setMusicConsent] = useState(false)
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
        setMusicConsent(!data.envelopeSettings?.enabled)
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
          // El saludo VIP ("¡Hola, {nombre}! Están cordialmente invitados")
          // vive únicamente en la Portada (Hero.config.vipGreeting) -- antes
          // se repetía acá también, mostrando el mismo mensaje dos veces
          // (sobre y portada). Esta pantalla ya personaliza con el nombre
          // vía el nameplate de arriba ("Invitación para {guestName}").
          welcomeMessage={event.envelopeSettings.welcomeMessage || ''}
          hasMusic={Boolean(event.musicSettings?.enabled)}
          onOpen={(withMusic) => {
            setMusicConsent(Boolean(withMusic))
            setIntroOpen(true)
          }}
        />
      )}

      {event.musicSettings?.enabled && (
        <MusicPlayerWidget
          settings={event.musicSettings}
          primaryColor={appearance.primaryColor}
          autoPlayTrigger={introOpen && musicConsent}
        />
      )}

      <motion.div
        initial={event.envelopeSettings?.enabled ? { opacity: 0, scale: 0.97 } : false}
        animate={introOpen ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SectionRenderer event={event} revealed={introOpen} />
      </motion.div>
    </div>
  )
}

export default DigitalCard
