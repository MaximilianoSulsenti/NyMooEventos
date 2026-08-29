import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Download, Printer, ListMusic, Music4, ListChecks, Clock3, Disc3, Armchair, CalendarClock } from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import GlassPanel from '../components/ui/GlassPanel'
import SongBankPanel from '../components/playlistOrganizer/SongBankPanel'
import AddMomentForm from '../components/playlistOrganizer/AddMomentForm'
import MomentCard from '../components/playlistOrganizer/MomentCard'
import AssignTracksModal from '../components/playlistOrganizer/AssignTracksModal'
import PlaylistPrintView from '../components/playlistOrganizer/PlaylistPrintView'
import usePlaylistOrganizer from '../hooks/usePlaylistOrganizer'
import { downloadPlaylistExcel } from '../utils/playlistOrganizer'
import { BRAND } from '../utils/brand'

function snapshotOf(songBank, moments) {
  return JSON.stringify({ songBank, moments })
}

// Cada bloque de momento (y su modal de asignación) rota por esta paleta en
// vez de ir todo en un solo color como el organizador de mesas -- le da a la
// pantalla una sensación más "de fiesta", coherente con lo que vende esta
// herramienta en particular.
const ACCENT_PALETTE = [BRAND.violet, BRAND.pink, BRAND.blue, BRAND.lime, BRAND.orange]
function accentForIndex(index) {
  return ACCENT_PALETTE[Math.max(0, index) % ACCENT_PALETTE.length]
}

// Notas musicales flotando de fondo, muy sutiles -- posiciones y tiempos
// fijos (nada de Math.random en el render) para que no titile distinto en
// cada re-render ni dispare el lint de pureza. Es decoración pura: baja
// opacidad, pointer-events-none, nunca compite con el contenido real.
const FLOATING_NOTES = [
  { symbol: '♪', top: '9%', left: '5%', size: '2.75rem', duration: 10, delay: 0, color: BRAND.violet },
  { symbol: '♫', top: '15%', left: '90%', size: '3.4rem', duration: 12, delay: 1.4, color: BRAND.pink },
  { symbol: '♬', top: '38%', left: '3%', size: '2.1rem', duration: 9, delay: 0.6, color: BRAND.blue },
  { symbol: '♩', top: '54%', left: '94%', size: '1.9rem', duration: 11, delay: 2.1, color: BRAND.violet },
  { symbol: '♪', top: '73%', left: '7%', size: '2.9rem', duration: 13, delay: 0.9, color: BRAND.pink },
  { symbol: '♫', top: '85%', left: '88%', size: '2.4rem', duration: 10.5, delay: 1.8, color: BRAND.blue },
  { symbol: '♬', top: '27%', left: '48%', size: '1.7rem', duration: 14, delay: 2.6, color: BRAND.violet },
]

// Dos formas de llegar acá con la misma pantalla:
// /dashboard/:eventId/playlist-manager (el dueño del evento, logueado) o
// /evento/:eventSlug/playlist?token=... (link exclusivo para clientes que
// solo compraron esta herramienta, sin login) -- mismo mecanismo dual que
// TableOrganizer.jsx.
function PlaylistOrganizer() {
  const { eventId, eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isClientMode = Boolean(eventSlug)

  const [eventName, setEventName] = useState('')
  const [activeModules, setActiveModules] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [assigningMoment, setAssigningMoment] = useState(null)
  const [printMode, setPrintMode] = useState(false)

  const organizer = usePlaylistOrganizer([], [])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        if (isClientMode) {
          if (!token) {
            if (isMounted) setLoadState('forbidden')
            return
          }
          const { data } = await api.get(`/events/client/${eventSlug}/playlist`, { params: { token } })
          if (!isMounted) return
          setEventName(data.eventName)
          setActiveModules(data.activeModules)
          organizer.loadFromServer(data.playlistSongBank, data.playlistTracks)
          setSavedSnapshot(snapshotOf(data.playlistSongBank, data.playlistTracks))
        } else {
          const { data } = await api.get(`/events/${eventId}`)
          if (!isMounted) return
          setEventName(data.eventName)
          setActiveModules(data.activeModules)
          organizer.loadFromServer(data.playlistSongBank || [], data.playlistTracks || [])
          setSavedSnapshot(snapshotOf(data.playlistSongBank || [], data.playlistTracks || []))
        }
        if (isMounted) setLoadState('ready')
      } catch (err) {
        if (!isMounted) return
        const status = err.response?.status
        setLoadState(status === 403 || status === 404 ? 'forbidden' : 'error')
      }
    }

    load()
    return () => {
      isMounted = false
    }
    // Se carga una sola vez por combinación de identificadores de la URL --
    // organizer.loadFromServer no entra en las deps a propósito, cambia de
    // referencia en cada render y reiniciaría el fetch en loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, eventSlug, token])

  const dirty = savedSnapshot !== null && snapshotOf(organizer.songBank, organizer.moments) !== savedSnapshot

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  async function handleSave() {
    setSaveState('saving')
    try {
      // El backend no conoce (ni necesita) el _id local que usamos en el
      // front para las keys de React -- se manda solo title/artist/notes,
      // Mongo asigna su propio _id real al guardar.
      const payload = {
        songBank: organizer.songBank.map(({ title, artist, notes }) => ({ title, artist, notes })),
        tracks: organizer.moments.map((m) => ({
          momentType: m.momentType,
          tracks: m.tracks.map(({ title, artist, notes }) => ({ title, artist, notes })),
          spotifyUrl: m.spotifyUrl || '',
        })),
      }
      let data
      if (isClientMode) {
        ;({ data } = await api.put(`/events/client/${eventSlug}/playlist`, payload, { params: { token } }))
      } else {
        ;({ data } = await api.put(`/events/${eventId}/playlist`, payload))
      }
      organizer.loadFromServer(data.playlistSongBank, data.playlistTracks)
      setSavedSnapshot(snapshotOf(data.playlistSongBank, data.playlistTracks))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }

  const existingMomentTypes = useMemo(() => organizer.moments.map((m) => m.momentType), [organizer.moments])
  const totalAssigned = useMemo(
    () => organizer.moments.reduce((sum, m) => sum + m.tracks.length, 0),
    [organizer.moments]
  )

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        Cargando planificador de playlist...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/50 text-center px-6" style={{ background: BRAND.night }}>
        <p>{isClientMode ? 'Este link no es válido.' : 'No tenés acceso a este evento.'}</p>
        {!isClientMode && (
          <Link to="/eventos" style={{ color: BRAND.violet }} className="hover:brightness-125 transition">
            Volver a mis eventos
          </Link>
        )}
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        No se pudo cargar el planificador de playlist.
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full text-white relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${BRAND.night} 0%, #1b1330 45%, ${BRAND.night} 100%)` }}
    >
      {/* Fondo decorativo, mismo criterio de capas que TableOrganizer.jsx
          (`absolute` DENTRO de este contenedor `relative`, primero en el DOM,
          contenido real después en `relative z-10`) pero con una identidad
          propia: resplandores violeta/rosa pulsando de a poco + notas
          musicales flotando bajito -- todo en opacidades muy bajas para que
          "no invada" el contenido, como pidió el cliente. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.violet}33, transparent 70%)` }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-16 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.pink}2e, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {FLOATING_NOTES.map((note, i) => (
          <motion.span
            key={i}
            className="absolute font-bold"
            style={{ top: note.top, left: note.left, fontSize: note.size, color: note.color, opacity: 0.07 }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: note.duration, repeat: Infinity, ease: 'easeInOut', delay: note.delay }}
          >
            {note.symbol}
          </motion.span>
        ))}

        <img
          src="/img/nymologo-navbar.png"
          alt=""
          className="absolute -right-6 -bottom-10"
          style={{ width: 'clamp(14rem, 42vw, 26rem)', height: 'auto', opacity: 0.1 }}
        />
        <p
          className="hidden lg:block absolute left-6 top-28 text-fuchsia-400/[0.09] text-xs font-bold tracking-[0.4em] uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Invitaciones Digitales Interactivas
        </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            {!isClientMode && (
              <Link
                to={`/dashboard/${eventId}`}
                className="flex items-center gap-1 text-white/40 text-xs uppercase tracking-widest hover:text-white transition mb-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Volver al panel
              </Link>
            )}
            <h1 className="font-modern tracking-tight text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
              <motion.span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND.violet}33, ${BRAND.pink}22)` }}
                animate={{ boxShadow: [`0 0 0 1px ${BRAND.violet}55`, `0 0 0 5px ${BRAND.violet}15`, `0 0 0 1px ${BRAND.violet}55`] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Music4 className="w-4 h-4" style={{ color: BRAND.pink }} />
              </motion.span>
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.violet}, ${BRAND.pink})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Planificador de playlist
              </span>
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{eventName}</p>
            {/* Botones cruzados hacia las otras herramientas -- solo
                aparecen si el evento también las tiene activas. Existen
                para que un evento del plan básico (sin panel de
                estadísticas) igual pueda descubrir las otras herramientas
                desde el link que le pasaste, sin depender de que le
                compartas varios links por separado. */}
            <div className="flex flex-wrap gap-2 mt-2">
              {activeModules?.tableOrganizer && (
                <motion.a
                  href={
                    isClientMode
                      ? `/evento/${encodeURIComponent(eventSlug)}/mesas?token=${encodeURIComponent(token)}`
                      : `/dashboard/${eventId}/mesas`
                  }
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 backdrop-blur-sm transition w-fit"
                  style={{ background: `linear-gradient(135deg, ${BRAND.blue}22, ${BRAND.lime}14)`, color: '#ffffff' }}
                >
                  <Armchair className="w-3.5 h-3.5" style={{ color: BRAND.lime }} />
                  Organizador de mesas
                </motion.a>
              )}
              {activeModules?.smartAgenda && (
                <motion.a
                  href={
                    isClientMode
                      ? `/evento/${encodeURIComponent(eventSlug)}/agenda?token=${encodeURIComponent(token)}`
                      : `/dashboard/${eventId}/agenda`
                  }
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 backdrop-blur-sm transition w-fit"
                  style={{ background: `linear-gradient(135deg, ${BRAND.orange}22, ${BRAND.pink}14)`, color: '#ffffff' }}
                >
                  <CalendarClock className="w-3.5 h-3.5" style={{ color: BRAND.orange }} />
                  Agenda inteligente
                </motion.a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPrintMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => downloadPlaylistExcel(eventName, organizer.moments)}
              disabled={organizer.moments.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-30"
            >
              <Download className="w-4 h-4" />
              Descargar cronograma
            </button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving' || !dirty}
              primaryColor={BRAND.violet}
              className="text-sm py-2.5 disabled:opacity-40"
            >
              {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado ✓' : 'Guardar cambios'}
            </Button>
          </div>
        </div>

        {dirty && saveState !== 'saving' && (
          <p className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
            Tenés cambios sin guardar.
          </p>
        )}
        {saveState === 'error' && <p className="text-red-400 text-sm">No se pudo guardar, probá de nuevo.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Disc3 className="w-3 h-3" style={{ color: BRAND.blue }} />
              Canciones
            </p>
            <p className="text-2xl font-extrabold">{organizer.songBank.length + totalAssigned}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <ListChecks className="w-3 h-3" style={{ color: BRAND.lime }} />
              Asignadas
            </p>
            <p className="text-2xl font-extrabold" style={{ color: BRAND.lime }}>
              {totalAssigned}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Clock3 className="w-3 h-3 text-yellow-400" />
              Pendientes
            </p>
            <p className="text-2xl font-extrabold text-yellow-400">{organizer.songBank.length}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <ListMusic className="w-3 h-3" style={{ color: BRAND.violet }} />
              Bloques
            </p>
            <p className="text-2xl font-extrabold" style={{ color: BRAND.violet }}>
              {organizer.moments.length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <GlassPanel accentColor={BRAND.violet} className="p-5 sm:p-6">
            <SongBankPanel
              songBank={organizer.songBank}
              onAddTracks={organizer.addTracks}
              onRemoveFromBank={organizer.removeFromBank}
            />
          </GlassPanel>

          <AddMomentForm existingMoments={existingMomentTypes} onAddMoment={organizer.addMoment} />
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-white/40" />
            Bloques de tanda musical ({organizer.moments.length})
          </h2>
          {organizer.moments.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-10 text-center text-white/40">
              Todavía no creaste ningún bloque -- agregá el primero desde el panel de arriba.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizer.moments.map((moment, index) => (
                <MomentCard
                  key={moment.momentType}
                  moment={moment}
                  index={index}
                  accentColor={accentForIndex(index)}
                  onAssign={setAssigningMoment}
                  onUnassign={organizer.unassignTrack}
                  onDelete={organizer.deleteMoment}
                  onSpotifyUrlChange={organizer.setMomentSpotifyUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {assigningMoment && (
          <AssignTracksModal
            moment={organizer.moments.find((m) => m.momentType === assigningMoment.momentType) || assigningMoment}
            accentColor={accentForIndex(organizer.moments.findIndex((m) => m.momentType === assigningMoment.momentType))}
            songBank={organizer.songBank}
            onConfirm={organizer.assignTracksToMoment}
            onClose={() => setAssigningMoment(null)}
          />
        )}
      </AnimatePresence>

      {printMode && (
        <PlaylistPrintView eventName={eventName} moments={organizer.moments} onClose={() => setPrintMode(false)} />
      )}
    </div>
  )
}

export default PlaylistOrganizer
