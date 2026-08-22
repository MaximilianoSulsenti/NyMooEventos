import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Play, Pause, Megaphone, X, Tv, QrCode as QrCodeIcon, Trash2, Download } from 'lucide-react'
import api from '../services/api'
import socket from '../services/socket'
import PageBackground from '../components/PageBackground'
import BrandLogos from '../components/BrandLogos'
import UploadAccessModal from '../components/UploadAccessModal'
import GlassPanel from '../components/ui/GlassPanel'
import { getThemeStyles } from '../sections/theming'
import { BRAND } from '../utils/brand'
import { getContrastTextColor } from '../utils/color'
import { cloudinaryThumb } from '../utils/cloudinary'

const ANNOUNCEMENT_POSITIONS = [
  { value: 'top', label: 'Arriba' },
  { value: 'center', label: 'Centro' },
  { value: 'bottom', label: 'Abajo' },
]

const ANNOUNCEMENT_SIZES = [
  { value: 'text-lg', label: 'Normal' },
  { value: 'text-xl', label: 'Grande' },
  { value: 'text-3xl', label: 'Muy grande' },
]

const TABS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
]

function MiniSwitch({ label, checked, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-pink-600' : 'bg-neutral-700'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </button>
    </div>
  )
}

function GalleryControl() {
  const { eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [photos, setPhotos] = useState([])
  const [event, setEvent] = useState(null)
  const [moderationMode, setModerationMode] = useState('automatica')
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [activeTab, setActiveTab] = useState('pendiente')
  const [partyMode, setPartyMode] = useState(false)
  const [partyLayout, setPartyLayout] = useState('grid') // grid | single
  const [confettiOn, setConfettiOn] = useState(false)
  const [lightBeamsOn, setLightBeamsOn] = useState(false)
  const [emojiRainOn, setEmojiRainOn] = useState(false)
  const [speedSeconds, setSpeedSeconds] = useState(7)
  const [isPaused, setIsPaused] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementPosition, setAnnouncementPosition] = useState('bottom')
  const [announcementFontSize, setAnnouncementFontSize] = useState('text-xl')
  const [announcementSent, setAnnouncementSent] = useState(false)
  const [albumState, setAlbumState] = useState('idle') // idle | 'loading:image' | 'loading:video'
  const [albumResult, setAlbumResult] = useState(null) // { type, parts, count } | null
  const [albumError, setAlbumError] = useState('')

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
        const gallerySettings = eventRes.data.gallerySettings || {}
        setPhotos(photosRes.data)
        setEvent(eventRes.data)
        setModerationMode(gallerySettings.moderationMode || 'automatica')
        setSpeedSeconds(gallerySettings.playbackSpeed || 7)
        setPartyMode(Boolean(gallerySettings.partyMode))
        setPartyLayout(gallerySettings.partyLayout || 'grid')
        setConfettiOn(Boolean(gallerySettings.confetti))
        setLightBeamsOn(Boolean(gallerySettings.lightBeams))
        setEmojiRainOn(Boolean(gallerySettings.emojiRain))
        setIsPaused(Boolean(gallerySettings.isPaused))
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

    function removePhoto({ photoId }) {
      setPhotos((prev) => prev.filter((p) => p._id !== photoId))
    }

    socket.on('new-photo', upsertPhoto)
    socket.on('photo-pending', upsertPhoto)
    socket.on('photo-deleted', removePhoto)

    return () => {
      socket.off('new-photo', upsertPhoto)
      socket.off('photo-pending', upsertPhoto)
      socket.off('photo-deleted', removePhoto)
      socket.disconnect()
    }
  }, [loadState, eventSlug])

  function persistLiveControls(patch) {
    api.patch(`/events/client/${eventSlug}/live-controls`, patch, { params: { token } }).catch(() => {})
  }

  function emitPartyConfig({
    enabled = partyMode,
    layout = partyLayout,
    confetti = confettiOn,
    lightBeams = lightBeamsOn,
    emojiRain = emojiRainOn,
  }) {
    socket.emit('set-party-config', { eventSlug, enabled, layout, confetti, lightBeams, emojiRain })
    persistLiveControls({ partyMode: enabled, partyLayout: layout, confetti, lightBeams, emojiRain })
  }

  function handleTogglePartyMode() {
    const next = !partyMode
    setPartyMode(next)
    emitPartyConfig({ enabled: next })
  }

  function handlePartyLayoutChange(next) {
    setPartyLayout(next)
    emitPartyConfig({ layout: next })
  }

  function handleToggleConfetti() {
    const next = !confettiOn
    setConfettiOn(next)
    emitPartyConfig({ confetti: next })
  }

  function handleToggleLightBeams() {
    const next = !lightBeamsOn
    setLightBeamsOn(next)
    emitPartyConfig({ lightBeams: next })
  }

  function handleToggleEmojiRain() {
    const next = !emojiRainOn
    setEmojiRainOn(next)
    emitPartyConfig({ emojiRain: next })
  }

  const speedSaveTimeout = useRef(null)

  function handleSpeedChange(value) {
    setSpeedSeconds(value)
    socket.emit('set-speed', { eventSlug, seconds: value })

    clearTimeout(speedSaveTimeout.current)
    speedSaveTimeout.current = setTimeout(() => {
      api.patch(`/events/client/${eventSlug}/playback-speed`, { seconds: value }, { params: { token } }).catch(() => {})
    }, 500)
  }

  function handleTogglePause() {
    const next = !isPaused
    setIsPaused(next)
    socket.emit('toggle-pause', { eventSlug, paused: next })
    persistLiveControls({ isPaused: next })
  }

  function sendAnnouncement(text) {
    socket.emit('set-announcement', { eventSlug, text, position: announcementPosition, fontSize: announcementFontSize })
    setAnnouncementSent(true)
    setTimeout(() => setAnnouncementSent(false), 1200)
  }

  function handleClearAnnouncement() {
    setAnnouncementText('')
    sendAnnouncement('')
  }

  async function handleGenerateAlbum(type) {
    setAlbumState(`loading:${type}`)
    setAlbumError('')
    setAlbumResult(null)
    try {
      const { data } = await api.get(`/photos/client/${eventSlug}/album-zip`, { params: { type, token } })
      setAlbumResult({ type, ...data })
    } catch (err) {
      setAlbumError(err.response?.data?.message || 'No se pudo generar la descarga')
    } finally {
      setAlbumState('idle')
    }
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

  async function handleDeletePhoto(photoId) {
    if (confirmDeleteId !== photoId) {
      setConfirmDeleteId(photoId)
      setTimeout(() => setConfirmDeleteId((current) => (current === photoId ? null : current)), 3000)
      return
    }

    setConfirmDeleteId(null)
    const previousPhotos = photos
    setPhotos((prev) => prev.filter((p) => p._id !== photoId))
    try {
      await api.delete(`/photos/client/${eventSlug}/${photoId}`, { params: { token } })
    } catch {
      setPhotos(previousPhotos)
    }
  }

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
        No se pudo cargar la galería.
      </div>
    )
  }

  const filteredPhotos = photos.filter((photo) => photo.status === activeTab)
  const styles = getThemeStyles(event?.uploadPageSettings?.theme)
  const primaryColor = event?.appearance?.primaryColor || '#a855f7'

  const liveFeedUrl = `${window.location.origin}/evento/${eventSlug}/live-feed`

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden text-white px-4 sm:px-6 py-6 sm:py-10 ${styles.fontClass}`}>
      <PageBackground settings={event?.uploadPageSettings} />
      {event && <BrandLogos branding={event.brandingSettings} />}
      <GlassPanel
        accentColor={primaryColor}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6"
        style={{ '--accent': primaryColor }}
      >
        <div className="space-y-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Hub de la Galería</h1>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
            {event?.activeModules?.liveGallery && (
              <motion.a
                href={liveFeedUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition text-sm font-medium text-center shadow-lg"
              >
                <Tv className="w-5 h-5 sm:w-4 sm:h-4" />
                Ver Pantalla en Vivo
              </motion.a>
            )}
            <motion.button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition text-sm font-medium text-center shadow-lg"
              style={{ background: primaryColor, color: getContrastTextColor(primaryColor) }}
            >
              <QrCodeIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              Acceso Invitados
            </motion.button>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Descargar álbum</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Arma un ZIP con las fotos/videos ya aprobados para que los novios se lo lleven antes de que se borre la carpeta del evento.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleGenerateAlbum('image')}
              disabled={albumState === 'loading:image'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40"
              style={{ background: primaryColor, color: getContrastTextColor(primaryColor) }}
            >
              <Download className="w-4 h-4" />
              {albumState === 'loading:image' ? 'Generando...' : 'Fotos (ZIP)'}
            </button>
            {event?.gallerySettings?.allowVideos && (
              <button
                type="button"
                onClick={() => handleGenerateAlbum('video')}
                disabled={albumState === 'loading:video'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium transition disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                {albumState === 'loading:video' ? 'Generando...' : 'Videos (ZIP)'}
              </button>
            )}
          </div>

          {albumError && <p className="text-xs text-red-400">{albumError}</p>}

          {albumResult && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-neutral-400">
                {albumResult.count} {albumResult.type === 'video' ? 'video(s)' : 'foto(s)'} listas
                {albumResult.parts.length > 1 ? `, en ${albumResult.parts.length} partes:` : ':'}
              </span>
              {albumResult.parts.map((url, index) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline underline-offset-2 hover:brightness-125"
                  style={{ color: primaryColor }}
                >
                  {albumResult.parts.length > 1 ? `Descargar parte ${index + 1}` : 'Descargar'}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-pink-950/40 to-neutral-900 border border-pink-500/20 p-4 space-y-4">
          <div className="flex items-center justify-between">
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

          {partyMode && (
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Formato:</span>
                <select
                  value={partyLayout}
                  onChange={(e) => handlePartyLayoutChange(e.target.value)}
                  className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="grid">Cuadrícula (varias fotos)</option>
                  <option value="single">Foto única, más rápido</option>
                </select>
              </div>

              <MiniSwitch label="Confetti 🎊" checked={confettiOn} onToggle={handleToggleConfetti} />
              <MiniSwitch label="Destellos de luz 🎇" checked={lightBeamsOn} onToggle={handleToggleLightBeams} />
              <MiniSwitch label="Lluvia de emojis 🥳" checked={emojiRainOn} onToggle={handleToggleEmojiRain} />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 space-y-4">
          <p className="text-sm font-medium">Control de reproducción en la pantalla</p>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleTogglePause}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                isPaused ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Reanudar' : 'Pausar foto actual'}
            </button>

            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <span className="text-xs text-neutral-400 whitespace-nowrap">Velocidad: {speedSeconds}s</span>
              <input
                type="range"
                min={2}
                max={15}
                step={1}
                value={speedSeconds}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Anuncio en pantalla
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value.slice(0, 140))}
                placeholder="Ej: ¡En 5 minutos abre la barra!"
                className="flex-1 min-w-[200px] rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              />
              <select
                value={announcementPosition}
                onChange={(e) => setAnnouncementPosition(e.target.value)}
                className="rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {ANNOUNCEMENT_POSITIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={announcementFontSize}
                onChange={(e) => setAnnouncementFontSize(e.target.value)}
                className="rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {ANNOUNCEMENT_SIZES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => sendAnnouncement(announcementText)}
                disabled={!announcementText.trim()}
                className="px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-40 text-sm font-medium transition"
                style={{ background: primaryColor, color: getContrastTextColor(primaryColor) }}
              >
                {announcementSent ? 'Enviado ✓' : 'Enviar'}
              </button>
              {announcementText && (
                <button
                  type="button"
                  onClick={handleClearAnnouncement}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition"
                  aria-label="Borrar anuncio"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-neutral-400">Modo de moderación:</span>
          <select
            value={moderationMode}
            onChange={(e) => handleModerationModeChange(e.target.value)}
            className="rounded-lg bg-neutral-800 border border-white/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              className="px-4 py-2 rounded-full text-sm transition"
              style={
                activeTab === tab.key
                  ? { background: primaryColor, color: getContrastTextColor(primaryColor) }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }
              }
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
                <div className="relative w-full aspect-square">
                  {photo.assetType === 'video' ? (
                    <>
                      <video src={cloudinaryThumb(photo.cloudinaryUrl)} muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <span className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <img src={cloudinaryThumb(photo.cloudinaryUrl)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
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
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo._id)}
                    className={`flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded-lg transition ${
                      confirmDeleteId === photo._id
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDeleteId === photo._id ? '¿Seguro?' : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {isUploadModalOpen && (
        <UploadAccessModal eventSlug={eventSlug} onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  )
}

export default GalleryControl
