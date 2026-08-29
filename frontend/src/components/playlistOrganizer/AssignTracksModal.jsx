import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check } from 'lucide-react'
import Button from '../ui/Button'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { BRAND } from '../../utils/brand'
import { cn } from '../../utils/cn'

function AssignTracksModal({ moment, songBank, accentColor = BRAND.violet, onConfirm, onClose }) {
  useLockBodyScroll()
  const [selected, setSelected] = useState([])

  function toggle(trackId) {
    setSelected((prev) => (prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]))
  }

  function handleConfirm() {
    if (selected.length > 0) onConfirm(moment.momentType, selected)
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
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-white/10 max-h-[85vh] flex flex-col"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold pr-8 truncate">{moment.momentType}</h2>
          <p className="text-white/40 text-xs mb-4">Elegí canciones del banco general para este bloque</p>

          <div className="flex-1 overflow-y-auto space-y-1.5 mb-4 pr-1">
            {songBank.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No hay canciones pendientes en el banco.</p>
            ) : (
              songBank.map((track) => {
                const isSelected = selected.includes(track._id)
                return (
                  <button
                    key={track._id}
                    type="button"
                    onClick={() => toggle(track._id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                      isSelected ? 'border-transparent bg-white/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
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
                    <span className="min-w-0 truncate">
                      {track.title}
                      {track.artist && <span className="text-white/40"> · {track.artist}</span>}
                    </span>
                  </button>
                )
              })
            )}
          </div>

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

export default AssignTracksModal
