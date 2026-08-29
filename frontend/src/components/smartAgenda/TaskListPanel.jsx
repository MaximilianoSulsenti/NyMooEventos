import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, MessageCircle, Trash2, CheckSquare, X } from 'lucide-react'
import { groupTasksByBucket, categoryColor, CATEGORY_META, formatTaskDate } from '../../utils/smartAgenda'
import { BRAND } from '../../utils/brand'

const BUCKET_LABELS = {
  overdue: 'Atrasadas',
  today: 'Para hoy',
  thisWeek: 'Esta semana',
  later: 'Más adelante',
}
const BUCKET_ORDER = ['overdue', 'today', 'thisWeek', 'later']

function TaskRow({ task, onToggleStatus, onEdit, onDelete, selectMode, isSelected, onToggleSelect }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDone = task.status === 'Completada'
  const color = categoryColor(task.category)
  const CategoryIcon = CATEGORY_META[task.category]?.Icon

  function handleDeleteClick(e) {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(task._id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={() => (selectMode ? onToggleSelect(task._id) : onEdit(task))}
      draggable={!selectMode}
      onDragStart={(e) => {
        // Permite arrastrar una tarea de la lista directo a un día del
        // calendario para reprogramarla (ver AgendaCalendar.jsx) -- mismo
        // payload ("text/plain" = _id) que los chips de las vistas de
        // semana/día, así los dos orígenes de drag comparten el mismo drop.
        e.dataTransfer.setData('text/plain', task._id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      role="button"
      tabIndex={0}
      className={`flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/[0.07] transition ${
        selectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {selectMode ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(task._id)
          }}
          aria-label={isSelected ? 'Quitar de la selección' : 'Seleccionar'}
          className="w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition"
          style={{ borderColor: isSelected ? color : 'rgba(255,255,255,0.25)', background: isSelected ? color : 'transparent' }}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </button>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleStatus(task)
          }}
          aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
          className="w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition"
          style={{ borderColor: isDone ? color : 'rgba(255,255,255,0.25)', background: isDone ? color : 'transparent' }}
        >
          {isDone && <Check className="w-3 h-3 text-white" />}
        </motion.button>
      )}

      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate transition ${isDone ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</p>
        <p className="text-white/40 text-xs flex items-center gap-1.5 mt-0.5">
          <span>
            {formatTaskDate(task.dueDate)}
            {task.dueTime && ` · ${task.dueTime}`}
          </span>
          {CategoryIcon && <CategoryIcon className="w-3 h-3" style={{ color }} />}
        </p>
      </div>

      {!selectMode && (
        <>
          {task.clientPhone && (
            <span
              title={`${task.reminderSent ? 'Recordatorio ya enviado' : 'Recordatorio por WhatsApp programado'}${
                task.clientName ? ` a ${task.clientName}` : ''
              }`}
              className="shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" style={{ color: task.reminderSent ? 'rgba(255,255,255,0.2)' : BRAND.lime }} />
            </span>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label={`Eliminar ${task.title}`}
            className={`shrink-0 transition ${confirmDelete ? 'text-red-400' : 'text-white/20 hover:text-red-400'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </motion.div>
  )
}

// Barra de selección múltiple -- pensada sobre todo para cuando cargás un
// checklist sugerido (ver TemplatePickerModal.jsx) y el cliente después
// prefiere tareas propias: en vez de entrar tarea por tarea al modal para
// borrarlas de a una, se seleccionan varias y se sacan juntas.
function SelectionBar({ selectedCount, totalCount, allSelected, onToggleSelectAll, onCancel, onDelete, confirmDelete }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
        >
          <CheckSquare className="w-3.5 h-3.5" style={{ opacity: allSelected ? 1 : 0.4 }} />
          {allSelected ? 'Deseleccionar todas' : `Seleccionar todas (${totalCount})`}
        </button>
        <p className="text-xs text-white/50">
          {selectedCount} tarea{selectedCount === 1 ? '' : 's'} seleccionada{selectedCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition px-2 py-1"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={selectedCount === 0}
          className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition disabled:opacity-30 ${
            confirmDelete ? 'bg-red-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? `¿Eliminar ${selectedCount}?` : 'Eliminar seleccionadas'}
        </button>
      </div>
    </div>
  )
}

function TaskListPanel({ tasks, onToggleStatus, onEdit, onDeleteTasks }) {
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  function toggleSelect(taskId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(tasks.map((t) => t._id)))
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
  }

  async function handleBulkDelete() {
    if (!confirmBulkDelete) {
      setConfirmBulkDelete(true)
      setTimeout(() => setConfirmBulkDelete(false), 3000)
      return
    }
    await onDeleteTasks([...selectedIds])
    exitSelectMode()
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-10 text-center text-white/40">
        Todavía no tenés tareas cargadas -- hacé click en un día del calendario para agregar la primera.
      </div>
    )
  }

  const buckets = groupTasksByBucket(tasks)

  return (
    <div>
      {selectMode ? (
        <SelectionBar
          selectedCount={selectedIds.size}
          totalCount={tasks.length}
          allSelected={allSelected}
          onToggleSelectAll={toggleSelectAll}
          onCancel={exitSelectMode}
          onDelete={handleBulkDelete}
          confirmDelete={confirmBulkDelete}
        />
      ) : (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Seleccionar varias
          </button>
        </div>
      )}

      <div className="space-y-5">
        {BUCKET_ORDER.map((key) => {
          const bucketTasks = buckets[key]
          if (bucketTasks.length === 0) return null
          return (
            <div key={key}>
              <p className={`text-xs uppercase tracking-wide mb-2 font-semibold ${key === 'overdue' ? 'text-red-400' : 'text-white/40'}`}>
                {BUCKET_LABELS[key]} ({bucketTasks.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {bucketTasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      onToggleStatus={onToggleStatus}
                      onEdit={onEdit}
                      onDelete={(taskId) => onDeleteTasks([taskId])}
                      selectMode={selectMode}
                      isSelected={selectedIds.has(task._id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TaskListPanel
