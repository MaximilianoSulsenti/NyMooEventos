import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import RsvpForm from '../components/RsvpForm'

function DigitalCard() {
  const { eventSlug } = useParams()
  const [event, setEvent] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | not-found | error
  const [isRsvpOpen, setIsRsvpOpen] = useState(false)

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

  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white flex flex-col items-center">
      <section className="w-full max-w-md flex flex-col items-center text-center px-6 pt-20 pb-12">
        <p className="uppercase tracking-[0.3em] text-purple-400 text-xs mb-4">
          Te invitamos a celebrar
        </p>
        <h1 className="text-4xl font-serif mb-3">{event.eventName}</h1>
        <div className="w-16 h-px bg-purple-500/50 my-6" />
        <p className="text-neutral-300 capitalize">{formattedDate}</p>
        <p className="text-neutral-400">{formattedTime} hs</p>
      </section>

      <section className="w-full max-w-md px-6 py-10 border-t border-white/10">
        <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-3">Ubicación</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-neutral-800 h-40 flex items-center justify-center text-neutral-500 text-sm">
          Mapa del salón (próximamente)
        </div>
        <p className="text-neutral-400 text-sm mt-3">La dirección exacta se compartirá más adelante.</p>
      </section>

      <section className="w-full max-w-md px-6 py-12 flex flex-col items-center">
        <p className="text-neutral-300 mb-6 text-center">
          Tu presencia es el mejor regalo. Contanos si nos acompañás.
        </p>
        <button
          type="button"
          onClick={() => setIsRsvpOpen(true)}
          className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 transition font-medium tracking-wide"
        >
          Confirmar asistencia
        </button>
      </section>

      {isRsvpOpen && (
        <RsvpForm eventSlug={eventSlug} onClose={() => setIsRsvpOpen(false)} />
      )}
    </div>
  )
}

export default DigitalCard
