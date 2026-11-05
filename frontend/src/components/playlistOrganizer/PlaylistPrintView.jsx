import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'

// Portal a document.body (mismo motivo que RsvpModalShell.jsx) -- sin esto
// la página de atrás (que sigue en el DOM, solo tapada visualmente) queda
// oculta con visibility:hidden al imprimir pero sigue ocupando su alto
// normal, empujando el contenido real varias hojas en blanco hacia abajo.
// Con el portal alcanza con ocultar #root entero para imprimir.
function PlaylistPrintView({ eventName, moments, onClose }) {
  return createPortal(
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto" style={{ background: '#f7f3ec' }}>
      <style>{`
        @media print {
          #root { display: none !important; }
          /* El div sigue siendo fixed+overflow-y-auto para la pantalla --
             eso solo clava el contenido a una sola hoja en vez de repartirse
             en tantas como haga falta. */
          .print-overlay { position: static; overflow: visible; height: auto; }
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
    </div>,
    document.body
  )
}

export default PlaylistPrintView
