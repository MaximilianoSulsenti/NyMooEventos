import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogOut, Plus, Calendar, Pencil, SquarePen, Check, X, Trash2, Receipt, DatabaseBackup, Loader2 } from 'lucide-react'
import api from '../services/api'
import { clearSession, getStoredUser } from '../services/auth'
import BrandBackground from '../components/BrandBackground'
import GlassPanel from '../components/ui/GlassPanel'
import Button from '../components/ui/Button'
import { BRAND } from '../utils/brand'

const CARD_ACCENTS = [BRAND.blue, BRAND.pink, BRAND.violet, BRAND.orange]

function EventsList() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [events, setEvents] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [eventName, setEventName] = useState('')
  const [eventSlug, setEventSlug] = useState('')
  const [date, setDate] = useState('')
  const [createError, setCreateError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [backupLoading, setBackupLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

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

  async function handleDelete(eventId) {
    if (confirmDeleteId !== eventId) {
      setConfirmDeleteId(eventId)
      setTimeout(() => setConfirmDeleteId((current) => (current === eventId ? null : current)), 3000)
      return
    }

    setConfirmDeleteId(null)
    const previousEvents = events
    setEvents((prev) => prev.filter((e) => e._id !== eventId))
    try {
      await api.delete(`/events/${eventId}`)
    } catch {
      setEvents(previousEvents)
    }
  }

  function startEdit(event) {
    setEditingId(event._id)
    setEditName(event.eventName)
    setEditSlug(event.eventSlug)
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function saveEdit(eventId) {
    setEditError('')
    setEditSaving(true)
    try {
      const { data } = await api.patch(`/events/${eventId}/basic-info`, {
        eventName: editName,
        eventSlug: editSlug,
      })
      setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, eventName: data.eventName, eventSlug: data.eventSlug } : e)))
      setEditingId(null)
    } catch (err) {
      setEditError(err.response?.data?.message || 'No se pudo guardar')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDownloadBackup() {
    setBackupLoading(true)
    try {
      // responseType 'blob' + descarga por <a download> porque es un
      // endpoint autenticado (necesita el header de sesión) -- no se puede
      // abrir como un link común con window.open. El nombre se arma acá
      // mismo (no se puede leer el Content-Disposition del backend sin
      // exponerlo por CORS, y no vale la pena solo para esto).
      const response = await api.get('/backup/download', { responseType: 'blob' })
      const filename = `nymoo-backup-${new Date().toISOString().slice(0, 10)}.json`

      const blobUrl = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      // Si falla (ej. todavía no corrió ningún backup), no hay mucho más
      // que mostrar acá -- el botón simplemente vuelve a su estado normal.
    } finally {
      setBackupLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // si falla igual cerramos la sesión localmente
    }
    clearSession()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen w-full text-white px-4 sm:px-6 py-10">
      <BrandBackground />

      <div className="max-w-3xl mx-auto space-y-6">
        <GlassPanel accentColor={BRAND.blue} className="px-5 sm:px-8 py-6 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-white/50 text-sm">Hola, {user?.name}</p>
              <h1 className="text-2xl font-semibold">Eventos</h1>
            </div>
            <div className="flex items-center gap-4">
              {user?.isAdmin && (
                <Link
                  to="/pedidos"
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
                >
                  <Receipt className="w-4 h-4" />
                  Pedidos
                </Link>
              )}
              {user?.isAdmin && (
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={backupLoading}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition disabled:opacity-50"
                >
                  {backupLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DatabaseBackup className="w-4 h-4" />
                  )}
                  Backup
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>

          {loadState === 'loading' && <p className="text-white/40">Cargando...</p>}
          {loadState === 'error' && <p className="text-red-400">No se pudieron cargar tus eventos.</p>}

          {loadState === 'ready' && (
            <div className="space-y-3">
              {events.length === 0 && (
                <p className="text-white/40">Todavía no hay ningún evento creado.</p>
              )}
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 pl-5 pr-3 py-4 overflow-hidden hover:bg-white/[0.08] hover:border-white/20 transition group">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ background: CARD_ACCENTS[index % CARD_ACCENTS.length] }}
                    />

                    {editingId === event._id ? (
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: `${CARD_ACCENTS[index % CARD_ACCENTS.length]}22`,
                            color: CARD_ACCENTS[index % CARD_ACCENTS.length],
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                        </span>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nombre del evento"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                            style={{ '--accent': BRAND.blue }}
                          />
                          <div className="flex items-center gap-1 text-white/30 text-sm">
                            <span>/evento/</span>
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              placeholder="slug-del-evento"
                              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                              style={{ '--accent': BRAND.blue }}
                            />
                          </div>
                          {editError && <p className="text-red-400 text-xs">{editError}</p>}
                        </div>
                      </div>
                    ) : (
                      <Link to={`/dashboard/${event._id}`} className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: `${CARD_ACCENTS[index % CARD_ACCENTS.length]}22`,
                            color: CARD_ACCENTS[index % CARD_ACCENTS.length],
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{event.eventName}</p>
                          <p className="text-white/40 text-sm">
                            {new Date(event.date).toLocaleDateString('es-ES')} · /{event.eventSlug}
                          </p>
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      {editingId === event._id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(event._id)}
                            disabled={editSaving}
                            aria-label="Guardar"
                            title="Guardar"
                            className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-50"
                          >
                            {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={editSaving}
                            aria-label="Cancelar"
                            title="Cancelar"
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(event)}
                            aria-label="Renombrar / cambiar slug"
                            title="Renombrar / cambiar slug"
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/dashboard/${event._id}/editor`}
                            aria-label="Editar evento"
                            title="Editar"
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(event._id)}
                            aria-label="Eliminar evento"
                            title="Eliminar"
                            className={`flex items-center gap-1 p-2 rounded-lg transition ${
                              confirmDeleteId === event._id
                                ? 'bg-red-600 text-white px-2.5'
                                : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            {confirmDeleteId === event._id && <span className="text-xs whitespace-nowrap">¿Seguro?</span>}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel accentColor={BRAND.orange} className="px-5 sm:px-8 py-6">
          <form onSubmit={handleCreate} className="space-y-3" style={{ '--accent': BRAND.orange }}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `${BRAND.orange}22`, color: BRAND.orange }}
              >
                <Plus className="w-4 h-4" />
              </span>
              <h2 className="font-medium">Crear nuevo evento</h2>
            </div>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Nombre del evento"
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <input
              type="text"
              value={eventSlug}
              onChange={(e) => setEventSlug(e.target.value)}
              placeholder="slug-del-evento"
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <p className="text-xs text-white/30 -mt-1">
              Se normaliza automáticamente a minúsculas y guiones (sin espacios ni símbolos), para que el link sea seguro de compartir.
            </p>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            {createError && <p className="text-red-400 text-sm">{createError}</p>}
            <Button type="submit" primaryColor={BRAND.orange} className="w-full mt-1">
              Crear evento
            </Button>
          </form>
        </GlassPanel>
      </div>
    </div>
  )
}

export default EventsList
