import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import socket from '../services/socket'

const TABS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
]

function GalleryControl() {
  const { eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [photos, setPhotos] = useState([])
  const [moderationMode, setModerationMode] = useState('automatica')
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [activeTab, setActiveTab] = useState('pendiente')
  const [partyMode, setPartyMode] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoadState('forbidden')
      return
    }

    Promise.all([
      api.get(`/photos/client/${eventSlug}`, { params: { token } }),
      api.get(`/events/slug/${eventSlug}`),
    ])
      .then(([photosRes, eventRes]) => {
        setPhotos(photosRes.data)
        setModerationMode(eventRes.data.gallerySettings?.moderationMode || 'automatica')
        setLoadState('ready')
      })
      .catch((err) => setLoadState(err.response?.status === 403 ? 'forbidden' : 'error'))
  }, [eventSlug, token])

  async function handleModerationModeChange(nextMode) {
    const previous = moderationMode
    setModerationMode(nextMode)
    try {
      await api.patch(
        `/events/client/${eventSlug}/moderation-mode`,
        { moderationMode: nextMode },
        { params: { token } }
      )
    } catch {
      setModerationMode(previous)
    }
  }

  useEffect(() => {
    if (loadState !== 'ready') return undefined

    socket.connect()
    socket.emit('join-event', eventSlug)

    function upsertPhoto(photo) {
      setPhotos((prev) => {
        const exists = prev.some((p) => p._id === photo._id)
        if (exists) return prev.map((p) => (p._id === photo._id ? photo : p))
        return [photo, ...prev]
      })
    }

    socket.on('new-photo', upsertPhoto)
    socket.on('photo-pending', upsertPhoto)

    return () => {
      socket.off('new-photo', upsertPhoto)
      socket.off('photo-pending', upsertPhoto)
      socket.disconnect()
    }
  }, [loadState, eventSlug])

  function handleTogglePartyMode() {
    const next = !partyMode
    setPartyMode(next)
    socket.emit('toggle-party-mode', { eventSlug, enabled: next })
  }

  async function updateStatus(photoId, status) {
    setPhotos((prev) => prev.map((p) => (p._id === photoId ? { ...p, status } : p)))
    try {
      await api.patch(`/photos/client/${eventSlug}/${photoId}/status`, { status }, { params: { token } })
    } catch {
      // revert on failure by refetching
      api
        .get(`/photos/client/${eventSlug}`, { params: { token } })
        .then(({ data }) => setPhotos(data))
        .catch(() => {})
    }
  }

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
        No se pudo cargar la galería.
      </div>
    )
  }

  const filteredPhotos = photos.filter((photo) => photo.status === activeTab)

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold">Control de galería</h1>

          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-white/10 px-4 py-2">
            <span className="text-sm font-medium">Modo Fiesta 🎉</span>
            <button
              type="button"
              role="switch"
              aria-checked={partyMode}
              onClick={handleTogglePartyMode}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                partyMode ? 'bg-pink-600' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  partyMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-neutral-400">Modo de moderación:</span>
          <select
            value={moderationMode}
            onChange={(e) => handleModerationModeChange(e.target.value)}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="automatica">Automática — pasan directo a la pantalla</option>
            <option value="manual">Manual — las apruebo yo una por una</option>
            <option value="semiautomatica">Semiautomática — filtra comentarios sospechosos</option>
          </select>
        </div>

        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {tab.label} ({photos.filter((p) => p.status === tab.key).length})
            </button>
          ))}
        </div>

        {filteredPhotos.length === 0 ? (
          <p className="text-neutral-500 text-center py-10">No hay fotos en esta pestaña.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div key={photo._id} className="rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                <img src={photo.cloudinaryUrl} alt="" className="w-full aspect-square object-cover" />
                {photo.comment && <p className="text-xs text-neutral-400 px-2 pt-2 truncate">{photo.comment}</p>}
                <div className="flex gap-2 p-2">
                  {activeTab !== 'aprobada' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(photo._id, 'aprobada')}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
                    >
                      Aprobar
                    </button>
                  )}
                  {activeTab !== 'rechazada' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(photo._id, 'rechazada')}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryControl
