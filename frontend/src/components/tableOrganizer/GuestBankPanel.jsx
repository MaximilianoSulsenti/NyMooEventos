import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileSpreadsheet, UserPlus, X, Search, Loader2, Users } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { cn } from '../../utils/cn'
import { parseGuestNamesFromFile } from '../../utils/tableOrganizer'

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition'

function GuestBankPanel({ allGuests, pendingGuests, onAddGuests, onRemoveGuest }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importState, setImportState] = useState('idle') // idle | reading | done | error
  const [importMessage, setImportMessage] = useState('')
  const [manualName, setManualName] = useState('')
  const [search, setSearch] = useState('')

  const filteredPending = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return pendingGuests
    return pendingGuests.filter((name) => name.toLowerCase().includes(term))
  }, [pendingGuests, search])

  async function importFile(file) {
    if (!file) return
    setImportState('reading')
    setImportMessage('')
    try {
      const names = await parseGuestNamesFromFile(file)
      if (names.length === 0) {
        setImportState('error')
        setImportMessage('No encontramos nombres en la primera columna de ese archivo.')
        return
      }
      const existing = new Set(allGuests)
      const newCount = names.filter((n) => !existing.has(n.trim())).length
      onAddGuests(names)
      setImportState('done')
      setImportMessage(
        newCount > 0
          ? `Se importaron ${newCount} invitado${newCount === 1 ? '' : 's'} nuevo${newCount === 1 ? '' : 's'}${
              names.length - newCount > 0 ? ` (${names.length - newCount} ya estaban en la lista)` : ''
            }.`
          : 'Todos los nombres de ese archivo ya estaban en la lista.'
      )
    } catch {
      setImportState('error')
      setImportMessage('No pudimos leer ese archivo. Probá con un Excel (.xlsx) o CSV.')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    importFile(e.dataTransfer.files?.[0])
  }

  function handleManualAdd(e) {
    e.preventDefault()
    if (!manualName.trim()) return
    onAddGuests([manualName])
    setManualName('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Invitados</h2>
        <p className="text-white/40 text-sm">Importá tu lista desde Excel o agregalos a mano.</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={cn(
          'rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition',
          isDragging ? 'border-transparent bg-white/[0.06]' : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04]'
        )}
        style={isDragging ? { boxShadow: `0 0 0 2px ${BRAND.blue}` } : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => importFile(e.target.files?.[0])}
        />
        <span
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: `${BRAND.blue}22`, color: BRAND.blue }}
        >
          {importState === 'reading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
        </span>
        <p className="text-sm font-medium">Arrastrá tu Excel acá, o hacé click para elegirlo</p>
        <p className="text-white/40 text-xs mt-1">Toma los nombres de la primera columna (.xlsx, .xls o .csv)</p>
      </div>

      {importMessage && (
        <p className={cn('text-xs', importState === 'error' ? 'text-red-400' : 'text-white/50')}>{importMessage}</p>
      )}

      <form onSubmit={handleManualAdd} className="flex gap-2">
        <input
          type="text"
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
          placeholder="Agregar invitado a mano"
          style={{ '--accent': BRAND.blue }}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!manualName.trim()}
          className="shrink-0 px-3.5 rounded-xl flex items-center justify-center transition disabled:opacity-30"
          style={{ background: `${BRAND.blue}22`, color: BRAND.blue }}
          aria-label="Agregar invitado"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs uppercase tracking-wide text-white/40 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Pendientes de asignar ({pendingGuests.length})
          </p>
        </div>

        {allGuests.length > 8 && (
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              style={{ '--accent': BRAND.blue }}
              className={cn(inputClass, 'pl-9 py-2 text-xs')}
            />
          </div>
        )}

        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {filteredPending.length === 0 && (
            <p className="text-white/30 text-xs text-center py-6">
              {pendingGuests.length === 0 ? 'No hay invitados pendientes.' : 'Ningún nombre coincide con la búsqueda.'}
            </p>
          )}
          <AnimatePresence initial={false}>
            {filteredPending.map((name) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5"
              >
                <span className="text-sm truncate min-w-0">{name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveGuest(name)}
                  aria-label={`Quitar a ${name} de la lista`}
                  className="shrink-0 text-white/30 hover:text-red-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default GuestBankPanel
