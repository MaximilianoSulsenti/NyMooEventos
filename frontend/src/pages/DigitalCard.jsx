import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import SectionRenderer from '../sections/SectionRenderer'
import { getThemeStyles } from '../sections/theming'

function DigitalCard() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | not-found | error

  useEffect(() => {
    let isMounted = true

    api
      .get(`/events/slug/${eventSlug}`)
      .then(({ data }) => {
        if (!isMounted) return
        setEvent(data)
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
    <div
      className={`min-h-screen text-white ${styles.fontClass}`}
      style={{ backgroundColor: appearance.backgroundColor || '#0a0a0a' }}
    >
      <SectionRenderer event={event} />
    </div>
  )
}

export default DigitalCard
