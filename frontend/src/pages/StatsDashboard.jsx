import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import GuestsTable from '../components/dashboard/GuestsTable'
import { guestsToCsv, downloadCsv } from '../utils/csv'

function StatsDashboard() {
  const { eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [event, setEvent] = useState(null)
  const [guests, setGuests] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error

  useEffect(() => {
    if (!token) {
      setLoadState('forbidden')
      return
    }

    Promise.all([
      api.get(`/events/slug/${eventSlug}`),
      api.get(`/guests/client/${eventSlug}`, { params: { token } }),
    ])
      .then(([eventRes, guestsRes]) => {
        setEvent(eventRes.data)
        setGuests(guestsRes.data)
        setLoadState('ready')
      })
      .catch((err) => {
        setLoadState(err.response?.status === 403 ? 'forbidden' : 'error')
      })
  }, [eventSlug, token])

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Cargando...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Este link no es válido. Pedile el link correcto a quien organiza el evento.
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        No se pudo cargar la información.
      </div>
    )
  }

  const total = guests.length
  const confirmados = guests.filter((g) => g.status === 'confirmado').length
  const declinados = guests.filter((g) => g.status === 'declinado').length
  const pendientes = guests.filter((g) => g.status === 'pendiente').length

  function handleExport() {
    const csv = guestsToCsv(guests)
    downloadCsv(csv, `invitados-${eventSlug}.csv`)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold">{event.eventName}</h1>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
          >
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de invitados" value={total} />
          <StatCard label="Confirmados" value={confirmados} accent="text-green-400" />
          <StatCard label="Declinados" value={declinados} accent="text-red-400" />
          <StatCard label="Pendientes" value={pendientes} accent="text-yellow-400" />
        </div>

        <GuestsTable guests={guests} />
      </div>
    </div>
  )
}

export default StatsDashboard
