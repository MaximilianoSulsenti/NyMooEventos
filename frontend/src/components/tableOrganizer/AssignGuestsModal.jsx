import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check } from 'lucide-react'
import Button from '../ui/Button'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { occupancyColor } from '../../utils/tableOrganizer'
import { cn } from '../../utils/cn'

// El acento del modal es el mismo color de ocupación de la mesa (ver
// TableCard.jsx) -- no un color de marca fijo -- para reforzar de un
// vistazo si estás asignando gente a una mesa con lugar, por llenarse, o ya
// al límite, sin tener que volver a mirar la card de atrás.
function AssignGuestsModal({ table, pendingGuests, onConfirm, onClose }) {
  useLockBodyScroll()
  const [selected, setSelected] = useState([])

  const remainingSeats = table.maxSeats - table.assignedGuests.length - selected.length
  const atCapacity = remainingSeats <= 0
  // Se recalcula en vivo con lo ya seleccionado (no solo lo guardado) para
  // que el acento se ponga amarillo/rojo a medida que se acerca al límite,
  // mismo criterio de color que la barra de ocupación de la card.
  const accentColor = occupancyColor(table.assignedGuests.length + selected.length, table.maxSeats)

  function toggle(name) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (atCapacity) return prev
      return [...prev, name]
    })
  }

  function handleConfirm() {
    if (selected.length > 0) onConfirm(table.tableNumber, selected)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border max-h-[85vh] flex flex-col"
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

          <h2 className="text-lg font-semibold pr-8 truncate">{table.tableName}</h2>
          <p className="text-white/40 text-xs mb-4">
            Mesa {table.tableNumber} · {table.assignedGuests.length + selected.length}/{table.maxSeats} ocupados
          </p>

          <div className="flex-1 overflow-y-auto space-y-1.5 mb-4 pr-1">
            {pendingGuests.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No hay invitados pendientes para asignar.</p>
            ) : (
              pendingGuests.map((name) => {
                const isSelected = selected.includes(name)
                const disabled = !isSelected && atCapacity
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(name)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                      isSelected ? 'border-transparent bg-white/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]',
                      disabled && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded flex items-center justify-center border shrink-0',
                        isSelected ? 'border-transparent' : 'border-white/20'
                      )}
                      style={isSelected ? { background: accentColor } : undefined}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="truncate">{name}</span>
                  </button>
                )
              })
            )}
          </div>

          {atCapacity && pendingGuests.length > 0 && (
            <p className="text-yellow-400 text-xs mb-3">La mesa llegó a su capacidad máxima.</p>
          )}

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            primaryColor={accentColor}
            className="w-full disabled:opacity-40"
          >
            {selected.length > 0 ? `Asignar (${selected.length})` : 'Asignar'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AssignGuestsModal
