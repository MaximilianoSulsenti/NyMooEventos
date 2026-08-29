import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileSpreadsheet, Plus, X, Search, Loader2, Music2, ExternalLink } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { cn } from '../../utils/cn'
import { parsePlaylistFromFile } from '../../utils/playlistOrganizer'

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 transition'

function SongBankPanel({ songBank, onAddTracks, onRemoveFromBank }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importState, setImportState] = useState('idle') // idle | reading | done | error
  const [importMessage, setImportMessage] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualArtist, setManualArtist] = useState('')
  const [search, setSearch] = useState('')

  const filteredBank = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return songBank
    return songBank.filter((t) => t.title.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term))
  }, [songBank, search])

  async function importFile(file) {
    if (!file) return
    setImportState('reading')
    setImportMessage('')
    try {
      const tracks = await parsePlaylistFromFile(file)
      if (tracks.length === 0) {
        setImportState('error')
        setImportMessage('No encontramos canciones en ese archivo.')
        return
      }
      const { bankCount, momentCount } = onAddTracks(tracks)
      setImportState('done')
      const parts = []
      if (bankCount > 0) parts.push(`${bankCount} al banco general`)
      if (momentCount > 0) parts.push(`${momentCount} directo a su momento`)
      setImportMessage(`Se importaron ${tracks.length} canción${tracks.length === 1 ? '' : 'es'} (${parts.join(' y ')}).`)
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
    if (!manualTitle.trim()) return
    onAddTracks([{ title: manualTitle, artist: manualArtist }])
    setManualTitle('')
    setManualArtist('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1">Banco de canciones</h2>
        <p className="text-white/40 text-sm">Importá tu lista desde Excel o agregalas a mano.</p>
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
        style={isDragging ? { boxShadow: `0 0 0 2px ${BRAND.violet}` } : undefined}
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
          style={{ background: `${BRAND.violet}22`, color: BRAND.violet }}
        >
          {importState === 'reading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
        </span>
        <p className="text-sm font-medium">Arrastrá tu Excel acá, o hacé click para elegirlo</p>
        <p className="text-white/40 text-xs mt-1">Columnas: Título, Artista, Notas y Momento (opcional)</p>
      </div>

      {/* Spotify ya no deja leer el contenido de playlists ajenas sin que su
          dueño inicie sesión (cambio de política de la API, feb. 2026) --
          la única forma de traer una playlist de Spotify acá es que el
          cliente la exporte él mismo a Excel (ej. con Exportify, gratis) y
          suba ese archivo con el dropzone de arriba. Antes esto era un
          simple link de texto con "exportify.net" subrayado -- confundía a
          más de uno pensando que los iba a llevar directo a la app de
          Spotify (en vez de una web donde inician sesión con su cuenta) --
          ahora es una tarjeta clickeable con ícono de link externo y la
          aclaración explícita de que es una web. */}
      <a
        href="https://exportify.net"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 -mt-2 hover:bg-white/[0.06] transition group"
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${BRAND.lime}22`, color: BRAND.lime }}
        >
          <Music2 className="w-4 h-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-white/70">¿Tenés tu playlist en Spotify?</span>
          <span className="block text-[11px] text-white/40 mt-0.5">
            Exportala a Excel en <span className="text-white/60 underline">exportify.net</span> -- es una página web,
            iniciás sesión ahí con tu cuenta de Spotify (no hace falta abrir la app) y subís el archivo acá arriba.
          </span>
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 transition shrink-0" />
      </a>

      {importMessage && (
        <p className={cn('text-xs', importState === 'error' ? 'text-red-400' : 'text-white/50')}>{importMessage}</p>
      )}

      <form onSubmit={handleManualAdd} className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <input
          type="text"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Título"
          style={{ '--accent': BRAND.violet }}
          className={inputClass}
        />
        <input
          type="text"
          value={manualArtist}
          onChange={(e) => setManualArtist(e.target.value)}
          placeholder="Artista (opcional)"
          style={{ '--accent': BRAND.violet }}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!manualTitle.trim()}
          className="shrink-0 px-3.5 rounded-xl flex items-center justify-center transition disabled:opacity-30"
          style={{ background: `${BRAND.violet}22`, color: BRAND.violet }}
          aria-label="Agregar canción"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs uppercase tracking-wide text-white/40 flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5" />
            Pendientes de asignar ({songBank.length})
          </p>
        </div>

        {songBank.length > 8 && (
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              style={{ '--accent': BRAND.violet }}
              className={cn(inputClass, 'pl-9 py-2 text-xs')}
            />
          </div>
        )}

        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {filteredBank.length === 0 && (
            <p className="text-white/30 text-xs text-center py-6">
              {songBank.length === 0 ? 'No hay canciones pendientes.' : 'Ninguna canción coincide con la búsqueda.'}
            </p>
          )}
          <AnimatePresence initial={false}>
            {filteredBank.map((track) => (
              <motion.div
                key={track._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5"
              >
                <span className="min-w-0 truncate text-sm">
                  {track.title}
                  {track.artist && <span className="text-white/40"> · {track.artist}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFromBank(track._id)}
                  aria-label={`Quitar ${track.title} de la lista`}
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

export default SongBankPanel
