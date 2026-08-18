import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { clearSession, getStoredUser } from '../services/auth'

function EventsList() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [events, setEvents] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [eventName, setEventName] = useState('')
  const [eventSlug, setEventSlug] = useState('')
  const [date, setDate] = useState('')
  const [createError, setCreateError] = useState('')

  function loadEvents() {
    setLoadState('loading')
    api
      .get('/events')
      .then(({ data }) => {
        setEvents(data)
        setLoadState('ready')
      })
      .catch(() => setLoadState('error'))
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setCreateError('')

    try {
      await api.post('/events', { eventName, eventSlug, date })
      setEventName('')
      setEventSlug('')
      setDate('')
      loadEvents()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'No se pudo crear el evento')
    }
  }

  function handleLogout() {
    clearSession()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-400 text-sm">Hola, {user?.name}</p>
            <h1 className="text-2xl font-semibold">Tus eventos</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-neutral-400 hover:text-white transition"
          >
            Cerrar sesión
          </button>
        </div>

        {loadState === 'loading' && <p className="text-neutral-400">Cargando...</p>}
        {loadState === 'error' && <p className="text-red-400">No se pudieron cargar tus eventos.</p>}

        {loadState === 'ready' && (
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-neutral-400">Todavía no creaste ningún evento.</p>
            )}
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/dashboard/${event._id}`}
                className="block rounded-xl bg-neutral-900 border border-white/10 p-4 hover:border-purple-500/50 transition"
              >
                <p className="font-medium">{event.eventName}</p>
                <p className="text-neutral-400 text-sm">
                  {new Date(event.date).toLocaleDateString('es-ES')} · /{event.eventSlug}
                </p>
              </Link>
            ))}
          </div>
        )}

        <form onSubmit={handleCreate} className="rounded-xl bg-neutral-900 border border-white/10 p-5 space-y-3">
          <h2 className="font-medium">Crear nuevo evento</h2>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Nombre del evento"
            required
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={eventSlug}
            onChange={(e) => setEventSlug(e.target.value)}
            placeholder="slug-del-evento"
            required
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
          {createError && <p className="text-red-400 text-sm">{createError}</p>}
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition font-medium"
          >
            Crear evento
          </button>
        </form>
      </div>
    </div>
  )
}

export default EventsList
