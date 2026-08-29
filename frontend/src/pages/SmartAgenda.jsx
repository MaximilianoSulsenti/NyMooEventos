import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarClock, Plus, Bell, Armchair, Music4, Download, Printer, ListChecks } from 'lucide-react'
import api from '../services/api'
import GlassPanel from '../components/ui/GlassPanel'
import AgendaCalendar from '../components/smartAgenda/AgendaCalendar'
import TaskListPanel from '../components/smartAgenda/TaskListPanel'
import TaskModal from '../components/smartAgenda/TaskModal'
import TemplatePickerModal from '../components/smartAgenda/TemplatePickerModal'
import AgendaPrintView from '../components/smartAgenda/AgendaPrintView'
import { downloadAgendaExcel, addDaysToDateString, addMonthsToDateString, toDateInputValue } from '../utils/smartAgenda'
import { BRAND } from '../utils/brand'

const ACCENT = BRAND.orange
// Tope de seguridad para tareas recurrentes -- si el evento está muy lejos
// (o no tiene fecha), evita generar una serie interminable de una sola vez.
const MAX_RECURRENCE_OCCURRENCES = 60

// Arma las fechas de una serie recurrente desde `startDate` hasta la fecha
// del evento (inclusive), con el paso que corresponda -- si el evento no
// tiene fecha cargada o ya pasó, devuelve solo la primera ocurrencia.
function buildRecurrenceDates(startDate, recurrence, eventDateIso) {
  const step = recurrence === 'weekly' ? (d) => addDaysToDateString(d, 7) : (d) => addMonthsToDateString(d, 1)
  const limit = eventDateIso ? toDateInputValue(eventDateIso) : null

  const dates = [startDate]
  let current = startDate
  for (let i = 1; i < MAX_RECURRENCE_OCCURRENCES; i++) {
    current = step(current)
    if (limit && current > limit) break
    dates.push(current)
  }
  return dates
}

// Íconos de agenda/notificación flotando muy tenues de fondo -- mismo
// recurso que las otras dos herramientas (posiciones y tiempos fijos, nada
// de Math.random en el render), con vocabulario propio de esta: campanas,
// calendario, mensajes.
const FLOATING_ICONS = [
  { Icon: Bell, top: '9%', left: '5%', size: 30, duration: 10, delay: 0, color: BRAND.orange },
  { Icon: CalendarClock, top: '16%', left: '91%', size: 32, duration: 12, delay: 1.4, color: BRAND.pink },
  { Icon: Bell, top: '56%', left: '94%', size: 22, duration: 11, delay: 2.1, color: BRAND.orange },
  { Icon: CalendarClock, top: '74%', left: '7%', size: 26, duration: 13, delay: 0.9, color: BRAND.pink },
  { Icon: Bell, top: '86%', left: '87%', size: 24, duration: 10.5, delay: 1.8, color: BRAND.orange },
  { Icon: CalendarClock, top: '28%', left: '48%', size: 20, duration: 14, delay: 2.6, color: BRAND.pink },
]

// Tres formas de llegar acá con la misma pantalla:
// /dashboard/:eventId/agenda (el dueño del evento, logueado) o
// /evento/:eventSlug/agenda?token=... (link exclusivo para clientes que
// solo compraron esta herramienta, sin login) -- mismo mecanismo dual que
// TableOrganizer.jsx/PlaylistOrganizer.jsx. A diferencia de esas dos, cada
// tarea es su propio documento en Mongo (colección Task aparte), así que
// las mutaciones pegan directo a la API en vez de acumularse en un botón
// "Guardar cambios" único.
function SmartAgenda() {
  const { eventId, eventSlug } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isClientMode = Boolean(eventSlug)

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState(null)
  const [activeModules, setActiveModules] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [modalTarget, setModalTarget] = useState(null) // { task? , initialDate? } | null
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [printMode, setPrintMode] = useState(false)

  const tasksPath = isClientMode ? `/tasks/client/${eventSlug}` : `/tasks/event/${eventId}`
  const tasksParams = isClientMode ? { token } : undefined

  const reloadTasks = useCallback(async () => {
    const { data } = await api.get(tasksPath, { params: tasksParams })
    setTasks(isClientMode ? data.tasks : data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksPath, token])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        if (isClientMode) {
          if (!token) {
            if (isMounted) setLoadState('forbidden')
            return
          }
          const { data } = await api.get(tasksPath, { params: tasksParams })
          if (!isMounted) return
          setEventName(data.eventName)
          setEventDate(data.date)
          setActiveModules(data.activeModules)
          setTasks(data.tasks)
        } else {
          const [eventRes, tasksRes] = await Promise.all([api.get(`/events/${eventId}`), api.get(tasksPath)])
          if (!isMounted) return
          setEventName(eventRes.data.eventName)
          setEventDate(eventRes.data.date)
          setActiveModules(eventRes.data.activeModules)
          setTasks(tasksRes.data)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, eventSlug, token])

  async function handleSaveTask(payload) {
    const { recurrence, ...taskFields } = payload
    if (modalTarget?.task) {
      await api.patch(`${tasksPath}/${modalTarget.task._id}`, taskFields, { params: tasksParams })
    } else if (recurrence && recurrence !== 'none') {
      // Cada ocurrencia se crea como una tarea independiente (ver
      // TaskModal.jsx) -- se manda una POST por fecha, en paralelo, todas
      // reusando la misma validación del backend que una tarea suelta.
      const dates = buildRecurrenceDates(taskFields.dueDate, recurrence, eventDate)
      await Promise.all(dates.map((dueDate) => api.post(tasksPath, { ...taskFields, dueDate }, { params: tasksParams })))
    } else {
      await api.post(tasksPath, taskFields, { params: tasksParams })
    }
    await reloadTasks()
  }

  // Único camino de borrado para todo -- el modal manda un solo id
  // ([modalTarget.task._id]), la lista manda uno (el trash de la fila) o
  // varios (selección múltiple) -- así un checklist cargado de más (ver
  // TemplatePickerModal.jsx) se puede sacar entero en un solo click en vez
  // de entrar tarea por tarea.
  async function handleDeleteTasks(taskIds) {
    await Promise.all(taskIds.map((taskId) => api.delete(`${tasksPath}/${taskId}`, { params: tasksParams })))
    await reloadTasks()
  }

  async function handleToggleStatus(task) {
    const nextStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada'
    // Optimista: el checkbox responde al instante, sin esperar la vuelta del
    // servidor -- es la acción más repetida de toda la pantalla.
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)))
    try {
      await api.patch(`${tasksPath}/${task._id}`, { status: nextStatus }, { params: tasksParams })
    } catch {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t)))
    }
  }

  // Arrastrar una tarea (desde la lista o desde la grilla del calendario) a
  // otro día -- ver AgendaCalendar.jsx/TaskListPanel.jsx, que disparan esto
  // con el nuevo dueDate ya calculado.
  async function handleRescheduleTask(taskId, newDueDate) {
    const task = tasks.find((t) => t._id === taskId)
    if (!task || task.dueDate === newDueDate) return

    const previousDueDate = task.dueDate
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, dueDate: newDueDate } : t)))
    try {
      await api.patch(`${tasksPath}/${taskId}`, { dueDate: newDueDate }, { params: tasksParams })
    } catch {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, dueDate: previousDueDate } : t)))
    }
  }

  // Carga en bloque el checklist sugerido de un tipo de evento -- cada tarea
  // de la plantilla define cuántos días antes del evento vence (ver
  // agendaTemplates.js), acá se resuelve contra la fecha real del evento.
  async function handleApplyTemplate(template) {
    if (!eventDate) return
    const baseDate = toDateInputValue(eventDate)
    await Promise.all(
      template.tasks.map((t) =>
        api.post(
          tasksPath,
          { title: t.title, category: t.category, dueDate: addDaysToDateString(baseDate, -t.daysBefore) },
          { params: tasksParams }
        )
      )
    )
    await reloadTasks()
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        Cargando agenda inteligente...
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/50 text-center px-6" style={{ background: BRAND.night }}>
        <p>{isClientMode ? 'Este link no es válido.' : 'No tenés acceso a este evento.'}</p>
        {!isClientMode && (
          <Link to="/eventos" style={{ color: ACCENT }} className="hover:brightness-125 transition">
            Volver a mis eventos
          </Link>
        )}
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: BRAND.night }}>
        No se pudo cargar la agenda inteligente.
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full text-white relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${BRAND.night} 0%, #331c12 45%, ${BRAND.night} 100%)` }}
    >
      {/* Fondo decorativo, mismo criterio de capas que las otras dos
          herramientas -- `absolute` DENTRO de este contenedor `relative`,
          primero en el DOM, contenido real después en `relative z-10`.
          Resplandores naranja/rosa pulsando de a poco + campanas y
          calendarios flotando muy tenues, nada compite con el contenido. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.orange}33, transparent 70%)` }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-16 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.pink}2e, transparent 70%)` }}
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
          className="hidden lg:block absolute left-6 top-28 text-orange-300/[0.09] text-xs font-bold tracking-[0.4em] uppercase"
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
                style={{ background: `linear-gradient(135deg, ${BRAND.orange}33, ${BRAND.pink}22)` }}
                animate={{ boxShadow: [`0 0 0 1px ${BRAND.orange}55`, `0 0 0 5px ${BRAND.orange}15`, `0 0 0 1px ${BRAND.orange}55`] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CalendarClock className="w-4 h-4" style={{ color: BRAND.pink }} />
              </motion.span>
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.pink})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Agenda inteligente
              </span>
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{eventName}</p>

            {/* Botones cruzados hacia las otras herramientas -- solo
                aparecen si el evento también las tiene activas. Existen
                para que un evento del plan básico (sin panel de
                estadísticas) igual pueda descubrir las otras herramientas
                desde cualquiera de los links que le pasaste. */}
            <div className="flex flex-wrap gap-2 mt-2">
              {activeModules?.tableOrganizer && (
                <motion.a
                  href={isClientMode ? `/evento/${encodeURIComponent(eventSlug)}/mesas?token=${encodeURIComponent(token)}` : `/dashboard/${eventId}/mesas`}
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
              {activeModules?.playlistOrganizer && (
                <motion.a
                  href={isClientMode ? `/evento/${encodeURIComponent(eventSlug)}/playlist?token=${encodeURIComponent(token)}` : `/dashboard/${eventId}/playlist-manager`}
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
              onClick={() => downloadAgendaExcel(eventName, tasks)}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-30"
            >
              <Download className="w-4 h-4" />
              Descargar Excel
            </button>
            <button
              type="button"
              onClick={() => setTemplateModalOpen(true)}
              disabled={!eventDate}
              title={eventDate ? undefined : 'Este evento todavía no tiene fecha cargada'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-30"
            >
              <ListChecks className="w-4 h-4" />
              Cargar checklist
            </button>
            <motion.button
              type="button"
              onClick={() => setModalTarget({ initialDate: new Date() })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition"
              style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.pink})`, color: '#fff' }}
            >
              <Plus className="w-4 h-4" />
              Nueva tarea
            </motion.button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
          <GlassPanel accentColor={ACCENT} className="p-5 sm:p-6">
            <AgendaCalendar
              tasks={tasks}
              selectedDate={modalTarget?.initialDate}
              onSelectDay={(date) => setModalTarget({ initialDate: date })}
              onEditTask={(task) => setModalTarget({ task })}
              onRescheduleTask={handleRescheduleTask}
              accentColor={ACCENT}
            />
          </GlassPanel>

          <div>
            <h2 className="text-base font-semibold mb-3">Tareas ({tasks.length})</h2>
            <TaskListPanel
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onEdit={(task) => setModalTarget({ task })}
              onDeleteTasks={handleDeleteTasks}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalTarget && (
          <TaskModal
            task={modalTarget.task}
            initialDate={modalTarget.initialDate}
            accentColor={ACCENT}
            onSave={handleSaveTask}
            onDelete={modalTarget.task ? () => handleDeleteTasks([modalTarget.task._id]) : undefined}
            onClose={() => setModalTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateModalOpen && (
          <TemplatePickerModal accentColor={ACCENT} onApply={handleApplyTemplate} onClose={() => setTemplateModalOpen(false)} />
        )}
      </AnimatePresence>

      {printMode && <AgendaPrintView eventName={eventName} tasks={tasks} onClose={() => setPrintMode(false)} />}
    </div>
  )
}

export default SmartAgenda
