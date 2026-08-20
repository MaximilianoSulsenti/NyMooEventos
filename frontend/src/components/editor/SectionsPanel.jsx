import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronUp, ChevronDown, Settings2 } from 'lucide-react'
import { SECTION_LABELS } from '../../sections/sectionDefs'
import SectionFieldEditor from './SectionFieldEditor'
import { cn } from '../../utils/cn'

function SectionsPanel({ eventId, sections, onChange }) {
  const [expandedId, setExpandedId] = useState(null)
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  function updateSection(id, patch) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function moveSection(id, direction) {
    const index = sorted.findIndex((s) => s.id === id)
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    const a = sorted[index]
    const b = sorted[swapIndex]
    onChange(
      sections.map((s) => {
        if (s.id === a.id) return { ...s, order: b.order }
        if (s.id === b.id) return { ...s, order: a.order }
        return s
      })
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((section, index) => (
        <div
          key={section.id}
          className={cn(
            'rounded-xl bg-neutral-900 border overflow-hidden transition-colors shadow-lg shadow-black/20',
            expandedId === section.id ? 'border-purple-500/50' : 'border-white/10'
          )}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(section.id, -1)}
                  className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === sorted.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                  className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-medium text-sm">{SECTION_LABELS[section.id] || section.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                className={cn(
                  'text-xs flex items-center gap-1 transition-colors',
                  expandedId === section.id ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                {expandedId === section.id ? 'Cerrar' : 'Editar'}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={section.enabled}
                onClick={() => updateSection(section.id, { enabled: !section.enabled })}
                className={cn(
                  'relative w-10 h-6 rounded-full transition-colors',
                  section.enabled ? 'bg-purple-600' : 'bg-neutral-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    section.enabled && 'translate-x-4'
                  )}
                />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {expandedId === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 border-t border-white/10 bg-neutral-950/50">
                  <SectionFieldEditor
                    eventId={eventId}
                    sectionId={section.id}
                    config={section.config || {}}
                    onChange={(config) => updateSection(section.id, { config })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export default SectionsPanel
