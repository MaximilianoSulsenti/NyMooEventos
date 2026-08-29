import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categoryColor, isSameDay, parseLocalDate, toDateInputValue } from '../../utils/smartAgenda'
import { cn } from '../../utils/cn'

const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const VIEW_MODES = [
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' },
]

// Grilla clásica de calendario: celdas vacías al principio para alinear el
// día 1 con su día de semana real, después un Date por cada día del mes.
function buildMonthGrid(year, month) {
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = new Array(startWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function buildWeekDays(anchorDate) {
  const start = startOfWeek(anchorDate)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function headerLabel(viewMode, anchorDate) {
  if (viewMode === 'day') {
    return `${WEEKDAY_SHORT[anchorDate.getDay()]} ${anchorDate.getDate()} de ${MONTH_LABELS[anchorDate.getMonth()]}`
  }
  if (viewMode === 'week') {
    const days = buildWeekDays(anchorDate)
    const first = days[0]
    const last = days[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} - ${last.getDate()} de ${MONTH_LABELS[first.getMonth()]}`
    }
    return `${first.getDate()} ${MONTH_LABELS[first.getMonth()].slice(0, 3)} - ${last.getDate()} ${MONTH_LABELS[last.getMonth()].slice(0, 3)}`
  }
  return `${MONTH_LABELS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
}

// Un "chip" de tarea, chico y arrastrable -- usado en las vistas de semana
// y día, donde hay lugar para mostrar cada tarea individual (a diferencia
// de la grilla mensual, que solo tiene lugar para puntitos de color).
function TaskChip({ task, onEditTask, onDragStart }) {
  const color = categoryColor(task.category)
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={(e) => {
        e.stopPropagation()
        onEditTask?.(task)
      }}
      className={cn(
        'w-full text-left px-1.5 py-1 rounded-md text-[10px] leading-tight truncate transition cursor-grab active:cursor-grabbing',
        task.status === 'Completada' ? 'line-through opacity-40' : 'hover:brightness-125'
      )}
      style={{ background: `${color}22`, color }}
    >
      {task.dueTime && <span className="font-semibold">{task.dueTime} </span>}
      {task.title}
    </button>
  )
}

function AgendaCalendar({ tasks, selectedDate, onSelectDay, onEditTask, onRescheduleTask, accentColor }) {
  const [viewMode, setViewMode] = useState('month')
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [dragOverKey, setDragOverKey] = useState(null)

  const cells = useMemo(
    () => (viewMode === 'month' ? buildMonthGrid(anchorDate.getFullYear(), anchorDate.getMonth()) : null),
    [viewMode, anchorDate]
  )
  const weekDays = useMemo(() => (viewMode === 'week' ? buildWeekDays(anchorDate) : null), [viewMode, anchorDate])

  const tasksByDay = useMemo(() => {
    const map = new Map()
    tasks.forEach((task) => {
      const key = parseLocalDate(task.dueDate).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(task)
    })
    return map
  }, [tasks])

  function navigate(delta) {
    setAnchorDate((prev) => {
      const next = new Date(prev)
      if (viewMode === 'month') next.setMonth(next.getMonth() + delta)
      else if (viewMode === 'week') next.setDate(next.getDate() + delta * 7)
      else next.setDate(next.getDate() + delta)
      return next
    })
  }

  function handleDragStart(e, task) {
    e.dataTransfer.setData('text/plain', task._id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, date) {
    e.preventDefault()
    setDragOverKey(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) onRescheduleTask?.(taskId, toDateInputValue(date))
  }

  const today = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          aria-label="Anterior"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${viewMode}-${anchorDate.toDateString()}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="font-modern tracking-tight text-sm font-semibold text-center"
            >
              {headerLabel(viewMode, anchorDate)}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(1)}
          aria-label="Siguiente"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex gap-1 mb-4 bg-white/[0.03] rounded-lg p-1">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.key}
            type="button"
            onClick={() => setViewMode(mode.key)}
            className={cn(
              'flex-1 text-[11px] font-medium py-1.5 rounded-md transition',
              viewMode === mode.key ? 'text-white' : 'text-white/40 hover:text-white/70'
            )}
            style={viewMode === mode.key ? { background: `${accentColor}35` } : undefined}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {viewMode === 'month' && (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/30 uppercase mb-2">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`blank-${i}`} />

              const dayKey = date.toDateString()
              const dayTasks = tasksByDay.get(dayKey) || []
              const categories = [...new Set(dayTasks.map((t) => t.category))].slice(0, 3)
              const isToday = isSameDay(date, today)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isDragOver = dragOverKey === dayKey

              return (
                <motion.button
                  key={dayKey}
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onSelectDay(date)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverKey(dayKey)
                  }}
                  onDragLeave={() => setDragOverKey((prev) => (prev === dayKey ? null : prev))}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition',
                    isSelected || isToday ? 'text-white font-semibold' : 'text-white/60 hover:bg-white/5'
                  )}
                  style={{
                    background: isDragOver ? `${accentColor}45` : isSelected ? `${accentColor}35` : isToday ? `${accentColor}16` : 'transparent',
                    boxShadow: isDragOver
                      ? `0 0 0 2px ${accentColor}`
                      : isSelected
                        ? `0 0 0 1.5px ${accentColor}`
                        : isToday
                          ? `0 0 0 1px ${accentColor}50`
                          : undefined,
                  }}
                >
                  <span>{date.getDate()}</span>
                  {categories.length > 0 && (
                    <span className="flex items-center gap-0.5">
                      {categories.map((cat) => (
                        <span key={cat} className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor(cat) }} />
                      ))}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((date) => {
            const dayKey = date.toDateString()
            const dayTasks = tasksByDay.get(dayKey) || []
            const isToday = isSameDay(date, today)
            const isDragOver = dragOverKey === dayKey

            return (
              <div
                key={dayKey}
                onClick={() => onSelectDay(date)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverKey(dayKey)
                }}
                onDragLeave={() => setDragOverKey((prev) => (prev === dayKey ? null : prev))}
                onDrop={(e) => handleDrop(e, date)}
                role="button"
                tabIndex={0}
                className="rounded-xl p-1.5 min-h-[7rem] flex flex-col gap-1 cursor-pointer transition"
                style={{
                  background: isDragOver ? `${accentColor}30` : isToday ? `${accentColor}12` : 'rgba(255,255,255,0.02)',
                  boxShadow: isDragOver ? `0 0 0 2px ${accentColor}` : isToday ? `0 0 0 1px ${accentColor}40` : '0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <p className={cn('text-[10px] text-center', isToday ? 'font-bold text-white' : 'text-white/40')}>
                  {WEEKDAY_SHORT[date.getDay()]} {date.getDate()}
                </p>
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {dayTasks.map((task) => (
                    <TaskChip key={task._id} task={task} onEditTask={onEditTask} onDragStart={handleDragStart} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'day' && (
        <div
          onClick={() => onSelectDay(anchorDate)}
          role="button"
          tabIndex={0}
          className="rounded-xl p-3 min-h-[10rem] space-y-1.5 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.02)', boxShadow: `0 0 0 1px ${accentColor}30` }}
        >
          {(tasksByDay.get(anchorDate.toDateString()) || []).length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6">Sin tareas este día -- hacé click para agregar una.</p>
          ) : (
            (tasksByDay.get(anchorDate.toDateString()) || []).map((task) => (
              <TaskChip key={task._id} task={task} onEditTask={onEditTask} onDragStart={handleDragStart} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AgendaCalendar
