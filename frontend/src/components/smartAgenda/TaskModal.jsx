import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Save, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { TASK_CATEGORIES, toDateInputValue } from '../../utils/smartAgenda'
import { BRAND } from '../../utils/brand'

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition'

// Un solo modal para crear (sin `task`) y editar (con `task`) -- evita
// duplicar el formulario, y `onDelete` solo se pasa/usa en modo edición.
function TaskModal({ task, initialDate, accentColor = BRAND.orange, onSave, onDelete, onClose }) {
  useLockBodyScroll()
  const isEdit = Boolean(task)

  const [title, setTitle] = useState(task?.title || '')
  const [category, setCategory] = useState(task?.category || 'Otros')
  // task.dueDate ya viene como "YYYY-MM-DD" del backend (ver models/Task.js)
  // -- se usa tal cual, sin pasarlo por un Date intermedio. Reconvertirlo
  // (Date -> string -> Date) fue justamente lo que corría la fecha un día
  // para atrás en Argentina al editar una tarea existente; toDateInputValue
  // solo hace falta para initialDate/hoy, que sí llegan como objetos Date
  // reales (celda del calendario clickeada).
  const [dueDate, setDueDate] = useState(task?.dueDate || toDateInputValue(initialDate || new Date()))
  const [dueTime, setDueTime] = useState(task?.dueTime || '')
  const [clientPhone, setClientPhone] = useState(task?.clientPhone || '')
  const [clientName, setClientName] = useState(task?.clientName || '')
  const [notes, setNotes] = useState(task?.notes || '')
  // Repetir solo aplica al crear -- editar una tarea que ya nació de una
  // serie repetida sería otra tarea (mover "todas las siguientes", "solo
  // esta", etc.), fuera de alcance acá. Cada ocurrencia queda como una tarea
  // independiente una vez creada.
  const [recurrence, setRecurrence] = useState('none') // none | weekly | monthly
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      await onSave({ title: title.trim(), category, dueDate, dueTime, clientPhone, clientName: clientName.trim(), notes, recurrence })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la tarea')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setSaving(true)
    try {
      await onDelete()
      onClose()
    } catch {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border max-h-[85vh] overflow-y-auto"
          style={{ borderColor: `${accentColor}40` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold pr-8 mb-4">{isEdit ? 'Editar tarea' : 'Nueva tarea'}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Prueba de maquillaje"
                required
                autoFocus
                style={{ '--accent': accentColor }}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
                >
                  {TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="text-white bg-neutral-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Hora (opcional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ '--accent': accentColor }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1">Fecha</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{ '--accent': accentColor }}
                className={inputClass}
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-xs text-white/40 mb-1">Repetir</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none"
                >
                  <option value="none" className="text-white bg-neutral-800">
                    No repetir
                  </option>
                  <option value="weekly" className="text-white bg-neutral-800">
                    Cada semana hasta el evento
                  </option>
                  <option value="monthly" className="text-white bg-neutral-800">
                    Cada mes hasta el evento
                  </option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-white/40 mb-1">Recordatorio por WhatsApp (opcional)</label>
              <p className="text-white/30 text-[11px] mb-1.5 -mt-0.5">
                No tiene que ser tu número: podés poner el de quien te esté ayudando a organizar esta tarea puntual
                (tu prima, tu hermana, quien sea) y el recordatorio le llega directo a esa persona.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre (ej. Sofía)"
                  style={{ '--accent': accentColor }}
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Teléfono, ej. 3416151235"
                  style={{ '--accent': accentColor }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{ '--accent': accentColor }}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

          <div className="flex items-center gap-2 mt-5">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className={`flex items-center justify-center gap-1.5 text-xs py-2.5 px-3 rounded-xl transition disabled:opacity-40 shrink-0 ${
                  confirmDelete ? 'bg-red-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmDelete ? '¿Seguro?' : ''}
              </button>
            )}
            <Button type="submit" disabled={saving || !title.trim()} primaryColor={accentColor} className="flex-1 py-2.5 text-sm disabled:opacity-40">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}

export default TaskModal
