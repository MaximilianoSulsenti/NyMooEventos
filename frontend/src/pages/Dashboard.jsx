import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { getStoredUser } from '../services/auth'
import StatCard from '../components/dashboard/StatCard'
import ModuleToggle from '../components/dashboard/ModuleToggle'
import GuestsTable from '../components/dashboard/GuestsTable'
import QuickAccessLinks from '../components/dashboard/QuickAccessLinks'

const NAV_SECTIONS = [
  { key: 'stats', label: 'Estadísticas' },
  { key: 'modules', label: 'Módulos' },
  { key: 'links', label: 'Accesos rápidos' },
]

const MODULE_FIELDS = [
  {
    key: 'interactiveCard',
    label: 'Tarjeta digital interactiva',
    description: 'Invitación pública optimizada para móviles.',
  },
  {
    key: 'guestControl',
    label: 'Control de invitados (RSVP)',
    description: 'Confirmación de asistencia, alérgenos y estadísticas.',
  },
  {
    key: 'liveGallery',
    label: 'Galería en vivo por QR',
    description: 'Subida de fotos y proyección en tiempo real.',
  },
]

function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const isAdmin = Boolean(getStoredUser()?.isAdmin)
  const [event, setEvent] = useState(null)
  const [guests, setGuests] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [activeSection, setActiveSection] = useState('stats')

  useEffect(() => {
    let isMounted = true

    Promise.all([
      api.get(`/events/${eventId}`),
      api.get(`/guests/event/${eventId}`),
    ])
      .then(([eventRes, guestsRes]) => {
        if (!isMounted) return
        setEvent(eventRes.data)
        setGuests(guestsRes.data)
        setLoadState('ready')
      })
      .catch((err) => {
        if (!isMounted) return
        const status = err.response?.status
        if (status === 401) {
          navigate('/')
        } else if (status === 403 || status === 404) {
          setLoadState('forbidden')
        } else {
          setLoadState('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [eventId, navigate])

  async function handleToggleModule(moduleKey, value) {
    if (!isAdmin) return

    const previousModules = event.activeModules
    setEvent((prev) => ({
      ...prev,
      activeModules: { ...prev.activeModules, [moduleKey]: value },
    }))

    try {
      await api.patch(`/events/${eventId}/modules`, { [moduleKey]: value })
    } catch {
      setEvent((prev) => ({ ...prev, activeModules: previousModules }))
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Cargando panel...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-400">
        <p>No tenés acceso a este evento.</p>
        <Link to="/eventos" className="text-purple-400 hover:text-purple-300">
          Volver a mis eventos
        </Link>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        No se pudo cargar el evento.
      </div>
    )
  }

  const total = guests.length
  const confirmados = guests.filter((g) => g.status === 'confirmado').length
  const declinados = guests.filter((g) => g.status === 'declinado').length
  const pendientes = guests.filter((g) => g.status === 'pendiente').length

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">
      <aside className="w-56 shrink-0 border-r border-white/10 p-6 flex flex-col gap-6">
        <div>
          <Link to="/eventos" className="text-neutral-400 text-xs uppercase tracking-widest hover:text-white transition">
            ← Mis eventos
          </Link>
          <h1 className="text-lg font-semibold truncate mt-1">{event.eventName}</h1>
          <Link
            to={`/dashboard/${eventId}/editor`}
            className="inline-block mt-2 text-xs text-purple-400 hover:text-purple-300 transition"
          >
            Editar invitación →
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_SECTIONS.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                activeSection === section.key
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-400 hover:bg-neutral-900'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {activeSection === 'stats' && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total de invitados" value={total} />
              <StatCard label="Confirmados" value={confirmados} accent="text-green-400" />
              <StatCard label="Declinados" value={declinados} accent="text-red-400" />
              <StatCard label="Pendientes" value={pendientes} accent="text-yellow-400" />
            </div>
            <GuestsTable guests={guests} />
          </section>
        )}

        {activeSection === 'modules' && (
          <section className="space-y-4 max-w-xl">
            {!isAdmin && (
              <p className="text-neutral-400 text-sm bg-neutral-900 border border-white/10 rounded-lg p-3">
                Los módulos los activa el equipo de NyMoo una vez confirmado el pago. Contactanos para habilitarlos.
              </p>
            )}
            {MODULE_FIELDS.map((field) => (
              <ModuleToggle
                key={field.key}
                label={field.label}
                description={field.description}
                checked={event.activeModules[field.key]}
                disabled={!isAdmin}
                onChange={(value) => handleToggleModule(field.key, value)}
              />
            ))}
          </section>
        )}

        {activeSection === 'links' && (
          <section className="max-w-2xl">
            <QuickAccessLinks eventSlug={event.eventSlug} clientAccessToken={event.clientAccessToken} />
          </section>
        )}
      </main>
    </div>
  )
}

export default Dashboard
