import { motion, AnimatePresence } from 'motion/react'
import { ListPlus, Trash2, X, Disc3 } from 'lucide-react'
import { SpotifyIcon } from '../icons/BrandIcons'
import { getSpotifyEmbedUrl } from '../../utils/playlistOrganizer'

const SPOTIFY_GREEN = '#1DB954'

// Cada bloque recibe un color distinto del palette rotativo que arma la
// página (ver ACCENT_PALETTE en PlaylistOrganizer.jsx) -- a diferencia de
// TableCard.jsx (monocromático, el color ahí codifica ocupación real), acá
// no hay una métrica de "lleno/vacío" que colorear, así que el color es
// puramente para variar visualmente cada tarjeta y que la grilla se sienta
// más viva, acorde a una herramienta de fiesta/música.
function MomentCard({ moment, index, accentColor, onAssign, onUnassign, onDelete, onSpotifyUrlChange }) {
  const embedUrl = getSpotifyEmbedUrl(moment.spotifyUrl)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className="backdrop-blur-md bg-white/5 border rounded-2xl p-6 flex flex-col"
      style={{ borderColor: `${accentColor}33` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => onDelete(moment.momentType)}
          aria-label={`Eliminar bloque ${moment.momentType}`}
          className="text-white/25 hover:text-red-400 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onAssign(moment)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        >
          <ListPlus className="w-3.5 h-3.5" style={{ color: accentColor }} />
          Agregar canciones
        </button>
      </div>

      <div
        className="text-center mb-4 py-3 rounded-xl px-2"
        style={{
          background: `${accentColor}12`,
          boxShadow: `inset 0 2px 6px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${accentColor}22`,
        }}
      >
        <p className="font-modern tracking-tight text-base font-bold leading-snug flex items-center justify-center gap-1.5">
          <Disc3 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
          <span className="truncate">{moment.momentType}</span>
        </p>
        <p className="text-xs mt-1 font-medium" style={{ color: accentColor }}>
          {moment.tracks.length} tema{moment.tracks.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex-1 space-y-1.5 min-h-8">
        {moment.tracks.length === 0 ? (
          <p className="text-white/25 text-xs text-center py-3">Sin canciones todavía</p>
        ) : (
          <AnimatePresence initial={false}>
            {moment.tracks.map((track) => (
              <motion.div
                key={track._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                style={{ boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.35)' }}
              >
                <span className="min-w-0 truncate">
                  <span className="font-modern tracking-tight text-sm">{track.title}</span>
                  {track.artist && <span className="text-white/40 text-xs"> · {track.artist}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => onUnassign(moment.momentType, track._id)}
                  aria-label={`Sacar ${track.title} de este bloque`}
                  className="shrink-0 text-white/20 hover:text-red-400 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Playlist pública de Spotify para ESTE bloque puntual -- convive con
          el banco de canciones de arriba, no lo reemplaza. Si el link
          matchea el patrón de una playlist de Spotify se muestra el
          reproductor embebido oficial; si no, el input queda guardado igual
          (por si todavía no es un link válido o es de otro momento). */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
        <div
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus-within:border-current transition"
          style={{ color: SPOTIFY_GREEN }}
        >
          <SpotifyIcon className="w-4 h-4 shrink-0" style={{ color: SPOTIFY_GREEN }} />
          <input
            type="text"
            value={moment.spotifyUrl || ''}
            onChange={(e) => onSpotifyUrlChange(moment.momentType, e.target.value)}
            placeholder="Pegá aquí el enlace de tu Playlist pública de Spotify"
            className="flex-1 min-w-0 bg-transparent text-white text-xs outline-none placeholder:text-white/30"
          />
        </div>

        {embedUrl && (
          <iframe
            title={`Spotify · ${moment.momentType}`}
            src={embedUrl}
            className="w-full rounded-2xl shadow-xl border border-white/10"
            height="152"
            style={{ colorScheme: 'normal' }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
      </div>
    </motion.div>
  )
}

export default MomentCard
