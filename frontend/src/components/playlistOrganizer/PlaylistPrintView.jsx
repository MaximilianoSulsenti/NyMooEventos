import { X, Printer } from 'lucide-react'

// Mismo truco que TablesPrintView.jsx/MessageBookPrint.jsx: fondo claro tipo
// papel, y en @media print se oculta todo el documento salvo
// .playlist-print-area, para que "Guardar como PDF" del navegador dé un
// resultado limpio listo para el DJ o el salón.
function PlaylistPrintView({ eventName, moments, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#f7f3ec' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .playlist-print-area, .playlist-print-area * { visibility: visible; }
          .playlist-print-area { position: absolute; inset: 0; margin: 0; }
          .no-print { display: none !important; }
          @page { margin: 1.6cm; }
        }
      `}</style>

      <div className="no-print fixed top-5 right-5 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-xl transition hover:brightness-110"
          style={{ background: '#1c1917', color: '#fff' }}
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar como PDF
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white shadow-xl text-neutral-500 hover:text-neutral-900 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="playlist-print-area max-w-3xl mx-auto px-6 py-16" style={{ color: '#1c1917' }}>
        <h1 className="text-3xl font-bold mb-1 text-center">{eventName}</h1>
        <p className="text-center text-neutral-500 text-sm mb-10">Cronograma musical</p>

        {moments.length === 0 ? (
          <p className="text-center text-neutral-400">Todavía no hay bloques armados.</p>
        ) : (
          <div className="space-y-8">
            {moments.map((moment, index) => (
              <div key={moment.momentType} className="break-inside-avoid">
                <p className="font-semibold text-lg mb-3 pb-2 border-b" style={{ borderColor: '#e7e1d6' }}>
                  {index + 1}. {moment.momentType}
                </p>
                {moment.tracks.length === 0 ? (
                  <p className="text-neutral-400 text-sm">Sin canciones asignadas</p>
                ) : (
                  <ol className="space-y-2.5 list-decimal list-inside text-sm">
                    {moment.tracks.map((track) => (
                      <li key={track._id} className="text-neutral-700">
                        <span className="font-medium text-neutral-900">{track.title}</span>
                        {track.artist && <span className="text-neutral-500"> — {track.artist}</span>}
                        {track.notes && <p className="text-neutral-400 text-xs italic ml-5 mt-0.5">{track.notes}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistPrintView
