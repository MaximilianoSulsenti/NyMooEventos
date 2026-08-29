import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Download, Printer, Users, Armchair, ListChecks, Clock3, UtensilsCrossed, Wine, Music4, CalendarClock } from 'lucide-react'
import api from '../services/api'
import Button from '../components/ui/Button'
import GlassPanel from '../components/ui/GlassPanel'
import GuestBankPanel from '../components/tableOrganizer/GuestBankPanel'
import AddTableForm from '../components/tableOrganizer/AddTableForm'
import TableCard from '../components/tableOrganizer/TableCard'
import AssignGuestsModal from '../components/tableOrganizer/AssignGuestsModal'
import TablesPrintView from '../components/tableOrganizer/TablesPrintView'
import useTableOrganizer from '../hooks/useTableOrganizer'
import { downloadTablesExcel } from '../utils/tableOrganizer'
import { BRAND } from '../utils/brand'

function snapshotOf(guests, tables) {
  return JSON.stringify({ guests, tables })
}

// Íconos de banquete/salón flotando muy tenues de fondo -- mismo recurso que
// las notas musicales del planificador de playlist (posiciones y tiempos
// fijos, nada de Math.random en el render), pero con un vocabulario visual
// propio de esta herramienta: sillas, cubiertos, copas, invitados.
const FLOATING_ICONS = [
  { Icon: Armchair, top: '9%', left: '5%', size: 34, duration: 10, delay: 0, color: BRAND.blue },
  { Icon: Wine, top: '16%', left: '91%', size: 30, duration: 12, delay: 1.4, color: BRAND.lime },
  { Icon: UtensilsCrossed, top: '40%', left: '3%', size: 26, duration: 9, delay: 0.6, color: BRAND.blue },
  { Icon: Users, top: '56%', left: '94%', size: 24, duration: 11, delay: 2.1, color: BRAND.lime },
  { Icon: Armchair, top: '74%', left: '7%', size: 30, duration: 13, delay: 0.9, color: BRAND.blue },
  { Icon: Wine, top: '86%', left: '87%', size: 26, duration: 10.5, delay: 1.8, color: BRAND.lime },
  { Icon: UtensilsCrossed, top: '28%', left: '48%', size: 22, duration: 14, delay: 2.6, color: BRAND.blue },
]

// Dos formas de llegar acá con la misma pantalla: /dashboard/:eventId/mesas
// (el dueño del evento, logueado) o /evento/:eventSlug/mesas?token=... (link
// exclusivo para clientes que solo compraron esta herramienta, sin login --
// mismo mecanismo que StatsDashboard/GalleryControl). El modo se detecta
// solo por qué param trae la URL.
function TableOrganizer() {
  const { eventId, eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isClientMode = Boolean(eventSlug)

  const [eventName, setEventName] = useState('')
  const [activeModules, setActiveModules] = useState(null)
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [assigningTable, setAssigningTable] = useState(null)
  const [printMode, setPrintMode] = useState(false)

  const organizer = useTableOrganizer([], [])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        if (isClientMode) {
          if (!token) {
            if (isMounted) setLoadState('forbidden')
            return
          }
          const { data } = await api.get(`/events/client/${eventSlug}/tables`, { params: { token } })
          if (!isMounted) return
          setEventName(data.eventName)
          setActiveModules(data.activeModules)
          organizer.loadFromServer(data.tableOrganizerGuests, data.tables)
          setSavedSnapshot(snapshotOf(data.tableOrganizerGuests, data.tables))
        } else {
          const { data } = await api.get(`/events/${eventId}`)
          if (!isMounted) return
          setEventName(data.eventName)
          setActiveModules(data.activeModules)
          organizer.loadFromServer(data.tableOrganizerGuests || [], data.tables || [])
          setSavedSnapshot(snapshotOf(data.tableOrganizerGuests || [], data.tables || []))
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

  const dirty = savedSnapshot !== null && snapshotOf(organizer.guests, organizer.tables) !== savedSnapshot

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
      const payload = { guests: organizer.guests, tables: organizer.tables }
      if (isClientMode) {
        await api.put(`/events/client/${eventSlug}/tables`, payload, { params: { token } })
      } else {
        await api.put(`/events/${eventId}/tables`, payload)
      }
      setSavedSnapshot(snapshotOf(organizer.guests, organizer.tables))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }

  const nextTableNumber = useMemo(
    () => organizer.tables.reduce((max, t) => Math.max(max, t.tableNumber), 0) + 1,
    [organizer.tables]
  )
  const totalAssigned = useMemo(
    () => organizer.tables.reduce((sum, t) => sum + t.assignedGuests.length, 0),
    [organizer.tables]
  )

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        Cargando organizador de mesas...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/50 text-center px-6" style={{ background: BRAND.night }}>
        <p>{isClientMode ? 'Este link no es válido.' : 'No tenés acceso a este evento.'}</p>
        {!isClientMode && (
          <Link to="/eventos" style={{ color: BRAND.blue }} className="hover:brightness-125 transition">
            Volver a mis eventos
          </Link>
        )}
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        No se pudo cargar el organizador de mesas.
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full text-white relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${BRAND.night} 0%, #0f1c3a 45%, ${BRAND.night} 100%)` }}
    >
      {/* Fondo decorativo. La versión anterior usaba fixed + z-index
          negativo, que en CSS no se apila de forma predecible contra un
          ancestro sin su propio stacking context -- quedaba tapada y no se
          veía. Ahora es un simple `absolute` DENTRO de este contenedor (que
          ya es `relative`), va primero en el DOM, y el contenido real
          después con `relative z-10` -- pintado determinista sin islas de
          z-index. Se le suman resplandores azul/lima pulsando de a poco e
          íconos de salón (sillas, copas, cubiertos) flotando muy tenues,
          mismo recurso que el planificador de playlist pero con identidad
          propia -- nada de esto compite con el contenido, son opacidades
          bajísimas. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.blue}33, transparent 70%)` }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-16 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.lime}26, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {FLOATING_ICONS.map(({ Icon, top, left, size, duration, delay, color }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top, left, color, opacity: 0.08 }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon width={size} height={size} />
          </motion.div>
        ))}

        <img
          src="/img/nymologo-navbar.png"
          alt=""
          className="absolute -right-6 -bottom-10"
          style={{ width: 'clamp(14rem, 42vw, 26rem)', height: 'auto', opacity: 0.1 }}
        />
        <p
          className="hidden lg:block absolute left-6 top-28 text-indigo-400/[0.09] text-xs font-bold tracking-[0.4em] uppercase"
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
                style={{ background: `linear-gradient(135deg, ${BRAND.blue}33, ${BRAND.lime}22)` }}
                animate={{ boxShadow: [`0 0 0 1px ${BRAND.blue}55`, `0 0 0 5px ${BRAND.blue}15`, `0 0 0 1px ${BRAND.blue}55`] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Armchair className="w-4 h-4" style={{ color: BRAND.lime }} />
              </motion.span>
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.lime})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Organizador de mesas
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
              {activeModules?.playlistOrganizer && (
                <motion.a
                  href={
                    isClientMode
                      ? `/evento/${encodeURIComponent(eventSlug)}/playlist?token=${encodeURIComponent(token)}`
                      : `/dashboard/${eventId}/playlist-manager`
                  }
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 backdrop-blur-sm transition w-fit"
                  style={{ background: `linear-gradient(135deg, ${BRAND.violet}22, ${BRAND.pink}14)`, color: '#ffffff' }}
                >
                  <Music4 className="w-3.5 h-3.5" style={{ color: BRAND.pink }} />
                  Planificador de playlist
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
              onClick={() => downloadTablesExcel(eventName, organizer.tables)}
              disabled={organizer.tables.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-30"
            >
              <Download className="w-4 h-4" />
              Descargar Excel
            </button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving' || !dirty}
              primaryColor={BRAND.blue}
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
              <Users className="w-3 h-3" style={{ color: BRAND.blue }} />
              Invitados
            </p>
            <p className="text-2xl font-extrabold">{organizer.guests.length}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <ListChecks className="w-3 h-3" style={{ color: BRAND.lime }} />
              Asignados
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
            <p className="text-2xl font-extrabold text-yellow-400">{organizer.pendingGuests.length}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Armchair className="w-3 h-3" style={{ color: BRAND.orange }} />
              Mesas
            </p>
            <p className="text-2xl font-extrabold" style={{ color: BRAND.orange }}>
              {organizer.tables.length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <GlassPanel accentColor={BRAND.blue} className="p-5 sm:p-6">
            <GuestBankPanel
              allGuests={organizer.guests}
              pendingGuests={organizer.pendingGuests}
              onAddGuests={organizer.addGuests}
              onRemoveGuest={organizer.removeGuest}
            />
          </GlassPanel>

          <AddTableForm nextTableNumber={nextTableNumber} onAddTable={organizer.addTable} />
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" />
            Mesas ({organizer.tables.length})
          </h2>
          {organizer.tables.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-10 text-center text-white/40">
              Todavía no creaste ninguna mesa -- agregá la primera desde el panel de arriba.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizer.tables.map((table, index) => (
                <TableCard
                  key={table.tableNumber}
                  table={table}
                  index={index}
                  onAssign={setAssigningTable}
                  onUnassign={organizer.unassignGuest}
                  onDelete={organizer.deleteTable}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {assigningTable && (
          <AssignGuestsModal
            table={organizer.tables.find((t) => t.tableNumber === assigningTable.tableNumber) || assigningTable}
            pendingGuests={organizer.pendingGuests}
            onConfirm={organizer.assignGuestsToTable}
            onClose={() => setAssigningTable(null)}
          />
        )}
      </AnimatePresence>

      {printMode && <TablesPrintView eventName={eventName} tables={organizer.tables} onClose={() => setPrintMode(false)} />}
    </div>
  )
}

export default TableOrganizer
