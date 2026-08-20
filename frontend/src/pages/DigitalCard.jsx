import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import api from '../services/api'
import SectionRenderer from '../sections/SectionRenderer'
import GlobalBackground from '../sections/GlobalBackground'
import Envelope from '../components/Envelope'
import { getThemeStyles } from '../sections/theming'

function DigitalCard() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | not-found | error
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => {
        if (!isMounted) return
        setEvent(data)
        setEnvelopeOpen(!data.envelopeSettings?.enabled)
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
    document.body.style.overflow = envelopeOpen ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [envelopeOpen])

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
  const styles = getThemeStyles(appearance.theme)

  return (
    <div className={`relative min-h-screen text-white ${styles.fontClass}`}>
      {appearance.useGlobalBackground ? (
        <GlobalBackground appearance={appearance} />
      ) : (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: appearance.backgroundColor || '#0a0a0a' }} />
      )}

      {event.envelopeSettings?.enabled && !envelopeOpen && (
        <Envelope
          settings={event.envelopeSettings}
          appearance={appearance}
          onOpen={() => setEnvelopeOpen(true)}
        />
      )}

      <motion.div
        initial={event.envelopeSettings?.enabled ? { opacity: 0, scale: 0.97 } : false}
        animate={envelopeOpen ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SectionRenderer event={event} />
      </motion.div>
    </div>
  )
}

export default DigitalCard
