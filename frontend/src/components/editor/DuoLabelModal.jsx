import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'
import { BRAND } from '../../utils/brand'

const PRESETS = ['Brindis', 'Fiesta']
const CUSTOM_VALUE = '__otro__'

// Antes el clon Dúo siempre se llamaba "{eventName} (Dúo)" fijo -- ahora se
// le pide al organizador para qué es esta segunda invitación (brindis,
// fiesta, o algo propio) y ese texto se usa en el nombre del evento y queda
// guardado en duoLabel (ver backend/models/Event.js) para más adelante,
// cuando el original tiene invitaciones VIP.
function DuoLabelModal({ onClose, onConfirm, submitting }) {
  const [choice, setChoice] = useState(PRESETS[0])
  const [customLabel, setCustomLabel] = useState('')

  const label = choice === CUSTOM_VALUE ? customLabel.trim() : choice

  function handleConfirm() {
    if (!label) return
    onConfirm(label)
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
          transition={{ duration: 0.25 }}
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl border border-white/10"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold mb-1">Crear versión Dúo</h2>
          <p className="text-white/40 text-xs mb-5">¿Para qué momento es esta segunda invitación?</p>

          <div className="space-y-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setChoice(preset)}
                className={cn(
                  'w-full text-left rounded-xl border px-3.5 py-2.5 text-sm transition',
                  choice === preset ? 'border-transparent bg-white/[0.08]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                )}
                style={choice === preset ? { boxShadow: `0 0 0 2px ${BRAND.blue}` } : undefined}
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChoice(CUSTOM_VALUE)}
              className={cn(
                'w-full text-left rounded-xl border px-3.5 py-2.5 text-sm transition',
                choice === CUSTOM_VALUE ? 'border-transparent bg-white/[0.08]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              )}
              style={choice === CUSTOM_VALUE ? { boxShadow: `0 0 0 2px ${BRAND.blue}` } : undefined}
            >
              Otro (escribirlo yo)
            </button>
          </div>

          {choice === CUSTOM_VALUE && (
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Ej: Segunda ceremonia"
              autoFocus
              className="w-full rounded-xl bg-neutral-800 border border-white/10 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition mb-4"
            />
          )}

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!label || submitting}
            primaryColor={BRAND.blue}
            className="w-full disabled:opacity-40"
          >
            {submitting ? 'Creando...' : 'Crear invitación Dúo'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DuoLabelModal
