import * as XLSX from 'xlsx'
import { CalendarClock, Wallet, Truck, Sparkles } from 'lucide-react'
import { BRAND } from './brand'

export const TASK_CATEGORIES = ['Cita/Reunión', 'Pago/Presupuesto', 'Proveedor', 'Otros']

// Un color + ícono por categoría, reusado en los puntitos del calendario, la
// fila de la lista y el selector del modal -- una sola fuente de verdad
// para no desincronizar el criterio visual entre los tres lugares.
export const CATEGORY_META = {
  'Cita/Reunión': { color: BRAND.blue, Icon: CalendarClock },
  'Pago/Presupuesto': { color: BRAND.orange, Icon: Wallet },
  Proveedor: { color: BRAND.violet, Icon: Truck },
  Otros: { color: BRAND.pink, Icon: Sparkles },
}

export function categoryColor(category) {
  return CATEGORY_META[category]?.color || BRAND.orange
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

// Parsea un "YYYY-MM-DD" (como lo guarda el backend, ver models/Task.js)
// como medianoche LOCAL, a mano, por componentes -- a propósito NUNCA
// `new Date("YYYY-MM-DD")`, que el spec de JS interpreta como medianoche
// UTC: en Argentina (UTC-3) eso corría la fecha un día para atrás apenas se
// mostraba (ej. una tarea del 20 aparecía agendada el 19). Es el inverso de
// toDateInputValue (que va de Date -> string); mezclar los dos sentidos fue
// justamente la causa del bug.
export function parseLocalDate(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Agrupa tareas en baldes cronológicos MECE (mutuamente excluyentes,
// exhaustivos) en función SOLO de la fecha, sin importar el estado -- una
// tarea completada sigue viéndose en su balde, tachada, en vez de
// desaparecer de la vista. "Atrasadas" es cualquier fecha ya pasada
// (completada o no); si ya la marcaste, verla tachada ahí es información
// correcta ("esto vencía antes y sí lo hiciste").
export function groupTasksByBucket(tasks) {
  const today = startOfDay(new Date())
  const weekLimit = new Date(today)
  weekLimit.setDate(weekLimit.getDate() + 7)

  const buckets = { overdue: [], today: [], thisWeek: [], later: [] }

  tasks.forEach((task) => {
    const due = parseLocalDate(task.dueDate)
    if (due.getTime() < today.getTime()) {
      buckets.overdue.push(task)
    } else if (due.getTime() === today.getTime()) {
      buckets.today.push(task)
    } else if (due.getTime() <= weekLimit.getTime()) {
      buckets.thisWeek.push(task)
    } else {
      buckets.later.push(task)
    }
  })

  return buckets
}

export function formatTaskDate(date) {
  return parseLocalDate(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

// Convierte un Date/ISO string a "YYYY-MM-DD" en horario LOCAL (no UTC) para
// precargar un <input type="date"> -- toISOString() sin este ajuste corre el
// riesgo de mostrar el día anterior en husos horarios negativos.
export function toDateInputValue(date) {
  const d = new Date(date)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function todayDateString() {
  return toDateInputValue(new Date())
}

// Aritmética de calendario para recurrencia y plantillas (ver
// TaskModal.jsx/agendaTemplates.js) -- siempre entra y sale como string
// "YYYY-MM-DD", nunca expone el Date intermedio, para no repetir el error
// de mezclar representaciones que causó el bug original.
export function addDaysToDateString(dateStr, days) {
  const date = parseLocalDate(dateStr)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}

export function addMonthsToDateString(dateStr, months) {
  const date = parseLocalDate(dateStr)
  date.setMonth(date.getMonth() + months)
  return toDateInputValue(date)
}

export function formatTaskDateLong(date) {
  return parseLocalDate(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Arma y descarga el Excel del checklist -- una fila por tarea, ordenadas
// cronológicamente (mismo orden que ya vienen del backend), con el estado
// como texto plano para que se pueda abrir e imprimir sin depender de la
// UI. Mismo patrón que downloadTablesExcel/downloadPlaylistExcel.
export function downloadAgendaExcel(eventName, tasks) {
  const rows = [['Fecha', 'Hora', 'Categoría', 'Tarea', 'Estado', 'Notas']]

  tasks.forEach((task) => {
    rows.push([
      formatTaskDateLong(task.dueDate),
      task.dueTime || '',
      task.category,
      task.title,
      task.status,
      task.notes || '',
    ])
  })

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = [{ wch: 16 }, { wch: 8 }, { wch: 16 }, { wch: 32 }, { wch: 12 }, { wch: 40 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Agenda')
  const safeName = (eventName || 'evento').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  XLSX.writeFile(workbook, `agenda-${safeName}.xlsx`)
}
