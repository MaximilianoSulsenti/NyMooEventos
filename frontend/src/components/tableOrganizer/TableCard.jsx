import { motion, AnimatePresence } from 'motion/react'
import { UserPlus, Trash2, X, Armchair } from 'lucide-react'
import { occupancyColor, sortNamesEs } from '../../utils/tableOrganizer'

// El color acá SIEMPRE sale de la ocupación real (occupancyColor), nunca de
// una paleta rotativa como en MomentCard.jsx del planificador de playlist --
// a diferencia de los bloques de tanda musical (donde no hay una métrica de
// "lleno/vacío" que colorear y el color es solo variedad visual), en mesas
// el color SÍ comunica algo real: verde con lugar, amarillo por llenarse,
// rojo al límite. El "plus" visual acá es que ese mismo color ahora también
// tiñe el borde de la card y el modal de asignación (ver
// AssignGuestsModal.jsx), reforzando la señal en vez de competir con ella.
function TableCard({ table, index, onAssign, onUnassign, onDelete }) {
  const occupied = table.assignedGuests.length
  const color = occupancyColor(occupied, table.maxSeats)
  const percent = Math.min(100, Math.round((occupied / table.maxSeats) * 100))
  const sortedGuests = sortNamesEs(table.assignedGuests)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className="backdrop-blur-md bg-white/5 border rounded-2xl p-6 flex flex-col"
      style={{ borderColor: `${color}33` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => onDelete(table.tableNumber)}
          aria-label={`Eliminar ${table.tableName}`}
          className="text-white/25 hover:text-red-400 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAssign(table)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Asignar
        </button>
      </div>

      <div
        className="text-center mb-4 py-3 rounded-xl px-2"
        style={{
          background: `${color}0d`,
          boxShadow: `inset 0 2px 6px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${color}22`,
        }}
      >
        <p className="font-modern tracking-tight text-4xl font-extrabold leading-none">{table.tableNumber}</p>
        <p className="font-modern tracking-tight text-sm text-white/60 mt-1 truncate flex items-center justify-center gap-1.5">
          <Armchair className="w-3 h-3 shrink-0" style={{ color }} />
          <span className="truncate">{table.tableName}</span>
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-white/40 mb-1">
          <span>Ocupación</span>
          <span style={{ color }}>
            {occupied}/{table.maxSeats}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-white/10 overflow-hidden"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-1.5 min-h-8">
        {sortedGuests.length === 0 ? (
          <p className="text-white/25 text-xs text-center py-3">Sin invitados todavía</p>
        ) : (
          <AnimatePresence initial={false}>
            {sortedGuests.map((name) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                style={{ boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.35)' }}
              >
                <span className="font-modern tracking-tight text-sm truncate min-w-0">{name}</span>
                <button
                  type="button"
                  onClick={() => onUnassign(table.tableNumber, name)}
                  aria-label={`Sacar a ${name} de esta mesa`}
                  className="shrink-0 text-white/20 hover:text-red-400 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}

export default TableCard
