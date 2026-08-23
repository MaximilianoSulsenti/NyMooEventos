import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, ToggleLeft, Link2, Pencil, ChevronLeft, Users, UserCheck, UserX, Clock } from 'lucide-react'
import api from '../services/api'
import { getStoredUser } from '../services/auth'
import PageBackground from '../components/PageBackground'
import GlassPanel from '../components/ui/GlassPanel'
import StatCard from '../components/dashboard/StatCard'
import ModuleToggle from '../components/dashboard/ModuleToggle'
import GuestsTable from '../components/dashboard/GuestsTable'
import QuickAccessLinks from '../components/dashboard/QuickAccessLinks'
import { BRAND } from '../utils/brand'

const NAV_SECTIONS = [
  { key: 'stats', label: 'Estadísticas', icon: LayoutDashboard },
  { key: 'modules', label: 'Módulos', icon: ToggleLeft },
  { key: 'links', label: 'Accesos rápidos', icon: Link2 },
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
    label: 'Galería en vivo por QR (Pack Proyector)',
    description: 'Subida de fotos + pantalla en vivo para el salón.',
  },
  {
    key: 'photoCollection',
    label: 'Álbum digital por QR',
    description: 'Los invitados suben fotos que se guardan organizadas en Cloudinary, sin transmitirse a ninguna pantalla.',
  },
  {
    key: 'messageBook',
    label: 'Libro de mensajes',
    description:
      'Junta en el Hub de Galería los nombres y comentarios que dejaron los invitados en sus fotos, con descarga a CSV. Requiere que los invitados puedan subir fotos (Galería en vivo o Álbum digital).',
  },
  {
    key: 'vipInvitations',
    label: 'Invitaciones VIP personalizadas',
    description:
      'Cada invitado tiene un link único con su nombre bloqueado y cupo de acompañantes fijo. El cliente carga la lista desde su panel de estadísticas.',
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
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        Cargando panel...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/50" style={{ background: BRAND.night }}>
        <p>No tenés acceso a este evento.</p>
        <Link to="/eventos" style={{ color: BRAND.blue }} className="hover:brightness-125 transition">
          Volver a mis eventos
        </Link>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        No se pudo cargar el evento.
      </div>
    )
  }

  // Los que solo dejaron una canción sugerida (sin completar el RSVP) no
  // cuentan para estas estadísticas de asistencia -- igual aparecen en la
  // tabla y en el Excel, solo que no ensucian estos números.
  const rsvpGuests = guests.filter((g) => g.rsvpCompleted !== false)
  const total = rsvpGuests.length
  const confirmados = rsvpGuests.filter((g) => g.status === 'confirmado').length
  const declinados = rsvpGuests.filter((g) => g.status === 'declinado').length
  const pendientes = rsvpGuests.filter((g) => g.status === 'pendiente').length

  return (
    <div className="relative min-h-screen w-full text-white">
      <PageBackground settings={event.uploadPageSettings} />

      <div className="relative flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-6xl mx-auto">
        <GlassPanel
          as="aside"
          accentColor={BRAND.blue}
          className="w-full lg:w-60 shrink-0 p-5 flex flex-col gap-6 lg:h-fit lg:sticky lg:top-6"
        >
          <div>
            <Link
              to="/eventos"
              className="flex items-center gap-1 text-white/40 text-xs uppercase tracking-widest hover:text-white transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Mis eventos
            </Link>
            <h1 className="text-lg font-semibold truncate mt-1">{event.eventName}</h1>
            <Link
              to={`/dashboard/${eventId}/editor`}
              className="inline-flex items-center gap-1 mt-2 text-xs hover:brightness-125 transition"
              style={{ color: BRAND.blue }}
            >
              <Pencil className="w-3 h-3" />
              Editar invitación
            </Link>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.key
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className="flex items-center gap-2.5 text-left px-3 py-2 rounded-xl text-sm transition"
                  style={
                    isActive
                      ? { background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.violet})`, color: '#ffffff', fontWeight: 600 }
                      : { color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </GlassPanel>

        <GlassPanel accentColor={BRAND.blue} className="flex-1 p-6 sm:p-8 space-y-6 min-w-0">
          {activeSection === 'stats' && (
            <section className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total de invitados" value={total} icon={Users} iconColor={BRAND.blue} delay={0} />
                <StatCard
                  label="Confirmados"
                  value={confirmados}
                  accent="text-[#B8F500]"
                  icon={UserCheck}
                  iconColor={BRAND.lime}
                  delay={0.05}
                />
                <StatCard
                  label="Declinados"
                  value={declinados}
                  accent="text-red-400"
                  icon={UserX}
                  iconColor="#f87171"
                  delay={0.1}
                />
                <StatCard
                  label="Pendientes"
                  value={pendientes}
                  accent="text-yellow-400"
                  icon={Clock}
                  iconColor="#facc15"
                  delay={0.15}
                />
              </div>
              <GuestsTable guests={guests} />
            </section>
          )}

          {activeSection === 'modules' && (
            <section className="space-y-4 max-w-xl">
              {!isAdmin && (
                <p className="text-white/50 text-sm bg-white/5 border border-white/10 rounded-xl p-3">
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
        </GlassPanel>
      </div>
    </div>
  )
}

export default Dashboard
