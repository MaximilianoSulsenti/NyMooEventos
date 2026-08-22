import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Download, Users, UserCheck, UserX, Clock } from 'lucide-react'
import api from '../services/api'
import PageBackground from '../components/PageBackground'
import BrandLogos from '../components/BrandLogos'
import GlassPanel from '../components/ui/GlassPanel'
import StatCard from '../components/dashboard/StatCard'
import GuestsTable from '../components/dashboard/GuestsTable'
import MessageBook from '../components/dashboard/MessageBook'
import { getThemeStyles } from '../sections/theming'
import { guestsToCsv, downloadCsv } from '../utils/csv'
import { BRAND } from '../utils/brand'
import { getContrastTextColor } from '../utils/color'

function StatsDashboard() {
  const { eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [event, setEvent] = useState(null)
  const [guests, setGuests] = useState([])
  const [photos, setPhotos] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error

  useEffect(() => {
    if (!token) {
      setLoadState('forbidden')
      return
    }

    Promise.all([
      api.get(`/events/slug/${eventSlug}`),
      api.get(`/guests/client/${eventSlug}`, { params: { token } }),
      api.get(`/photos/client/${eventSlug}`, { params: { token } }),
    ])
      .then(([eventRes, guestsRes, photosRes]) => {
        setEvent(eventRes.data)
        setGuests(guestsRes.data)
        setPhotos(photosRes.data)
        setLoadState('ready')
      })
      .catch((err) => {
        setLoadState(err.response?.status === 403 ? 'forbidden' : 'error')
      })
  }, [eventSlug, token])

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40" style={{ background: BRAND.night }}>
        Cargando...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40" style={{ background: BRAND.night }}>
        Este link no es válido. Pedile el link correcto a quien organiza el evento.
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40" style={{ background: BRAND.night }}>
        No se pudo cargar la información.
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

  const styles = getThemeStyles(event?.uploadPageSettings?.theme)
  const primaryColor = event?.appearance?.primaryColor || '#a855f7'

  function handleExport() {
    const csv = guestsToCsv(guests)
    downloadCsv(csv, `invitados-${eventSlug}.csv`)
  }

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden text-white px-4 sm:px-6 py-6 sm:py-10 ${styles.fontClass}`}>
      <PageBackground settings={event?.uploadPageSettings} />
      <BrandLogos branding={event.brandingSettings} />

      <GlassPanel accentColor={primaryColor} className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold break-words">{event.eventName}</h1>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition hover:brightness-110 shadow-lg"
            style={{ background: primaryColor, color: getContrastTextColor(primaryColor) }}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de invitados" value={total} icon={Users} iconColor={primaryColor} delay={0} />
          <StatCard
            label="Confirmados"
            value={confirmados}
            accent="text-[#B8F500]"
            icon={UserCheck}
            iconColor="#B8F500"
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

        <MessageBook photos={photos} eventSlug={eventSlug} primaryColor={primaryColor} />
      </GlassPanel>
    </div>
  )
}

export default StatsDashboard
