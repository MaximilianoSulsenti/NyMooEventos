import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ListChecks, Loader2 } from 'lucide-react'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { AGENDA_TEMPLATES } from '../../utils/agendaTemplates'
import { BRAND } from '../../utils/brand'

// Lista las plantillas por tipo de evento y dispara `onApply(template)` --
// quien la use (SmartAgenda.jsx) es responsable de calcular las fechas
// reales (event.date - daysBefore) y crear las tareas, este modal solo
// elige cuál plantilla.
function TemplatePickerModal({ onApply, onClose, accentColor = BRAND.orange }) {
  useLockBodyScroll()
  const [applyingId, setApplyingId] = useState(null)

  async function handleApply(template) {
    setApplyingId(template.id)
    try {
      await onApply(template)
      onClose()
    } catch {
      setApplyingId(null)
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
        <motion.div
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

          <h2 className="text-lg font-semibold pr-8 mb-1">Cargar checklist sugerido</h2>
          <p className="text-white/40 text-xs mb-4">
            Elegí el tipo de evento y sumamos de una las tareas típicas, con fechas calculadas hacia atrás desde el día del
            evento.
          </p>

          <div className="space-y-2">
            {AGENDA_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                disabled={applyingId !== null}
                onClick={() => handleApply(template)}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] px-4 py-3 text-left transition disabled:opacity-40"
              >
                <span>
                  <span className="block text-sm font-medium">{template.label}</span>
                  <span className="block text-white/40 text-xs mt-0.5">{template.tasks.length} tareas sugeridas</span>
                </span>
                {applyingId === template.id ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: accentColor }} />
                ) : (
                  <ListChecks className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TemplatePickerModal
