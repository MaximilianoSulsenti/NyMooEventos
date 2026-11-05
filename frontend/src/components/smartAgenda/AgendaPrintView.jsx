import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import { groupTasksByBucket, formatTaskDateLong } from '../../utils/smartAgenda'

const BUCKET_LABELS = {
  overdue: 'Atrasadas',
  today: 'Para hoy',
  thisWeek: 'Esta semana',
  later: 'Más adelante',
}
const BUCKET_ORDER = ['overdue', 'today', 'thisWeek', 'later']

// Portal a document.body (mismo motivo que RsvpModalShell.jsx) -- sin esto
// la página de atrás (que sigue en el DOM, solo tapada visualmente) queda
// oculta con visibility:hidden al imprimir pero sigue ocupando su alto
// normal, empujando el contenido real varias hojas en blanco hacia abajo.
// Con el portal alcanza con ocultar #root entero para imprimir.
function AgendaPrintView({ eventName, tasks, onClose }) {
  const buckets = groupTasksByBucket(tasks)

  return createPortal(
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto" style={{ background: '#f7f3ec' }}>
      <style>{`
        @media print {
          #root { display: none !important; }
          /* El div sigue siendo fixed+overflow-y-auto para la pantalla --
             eso solo clava el contenido a una sola hoja en vez de repartirse
             en tantas como haga falta. */
          .print-overlay { position: static; overflow: visible; height: auto; }
          .no-print { display: none !important; }
          @page { margin: 1.6cm; }
        }
      `}</style>

      <div className="no-print fixed top-5 right-5 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-xl transition hover:brightness-110"
          style={{ background: '#1c1917', color: '#fff' }}
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar como PDF
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white shadow-xl text-neutral-500 hover:text-neutral-900 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="agenda-print-area max-w-3xl mx-auto px-6 py-16" style={{ color: '#1c1917' }}>
        <h1 className="text-3xl font-bold mb-1 text-center">{eventName}</h1>
        <p className="text-center text-neutral-500 text-sm mb-10">Agenda de tareas</p>

        {tasks.length === 0 ? (
          <p className="text-center text-neutral-400">Todavía no hay tareas cargadas.</p>
        ) : (
          <div className="space-y-8">
            {BUCKET_ORDER.map((key) => {
              const bucketTasks = buckets[key]
              if (bucketTasks.length === 0) return null
              return (
                <div key={key} className="break-inside-avoid">
                  <p className="font-semibold text-lg mb-3 pb-2 border-b" style={{ borderColor: '#e7e1d6' }}>
                    {BUCKET_LABELS[key]} ({bucketTasks.length})
                  </p>
                  <ul className="space-y-2.5 text-sm">
                    {bucketTasks.map((task) => (
                      <li key={task._id} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0">{task.status === 'Completada' ? '☑' : '☐'}</span>
                        <span className="min-w-0">
                          <span className={task.status === 'Completada' ? 'line-through text-neutral-400' : 'text-neutral-900'}>
                            {task.title}
                          </span>
                          <span className="text-neutral-500">
                            {' '}
                            — {formatTaskDateLong(task.dueDate)}
                            {task.dueTime && ` · ${task.dueTime}`} · {task.category}
                          </span>
                          {task.notes && <p className="text-neutral-400 text-xs italic mt-0.5">{task.notes}</p>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default AgendaPrintView
