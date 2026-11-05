import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'

// Portal a document.body (mismo motivo que RsvpModalShell.jsx) -- sin esto
// la página de atrás (que sigue en el DOM, solo tapada visualmente) queda
// oculta con visibility:hidden al imprimir pero sigue ocupando su alto
// normal, empujando el listado real varias hojas en blanco hacia abajo.
// Con el portal alcanza con ocultar #root entero para imprimir.
function GuestsPrintView({ eventName, guests, onClose }) {
  const totalPersonas = guests.reduce((sum, guest) => sum + 1 + (guest.companionsCount || 0), 0)

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

      <div className="guests-print-area max-w-3xl mx-auto px-6 py-16" style={{ color: '#1c1917' }}>
        <h1 className="text-3xl font-bold mb-1 text-center">{eventName}</h1>
        <p className="text-center text-neutral-500 text-sm mb-1">Listado de invitados confirmados</p>
        <p className="text-center text-neutral-400 text-xs mb-10">
          {guests.length} confirmaci{guests.length === 1 ? 'ón' : 'ones'} · {totalPersonas}{' '}
          persona{totalPersonas === 1 ? '' : 's'} en total
        </p>

        {guests.length === 0 ? (
          <p className="text-center text-neutral-400">Todavía no hay confirmados.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#1c1917' }}>
                <th className="text-left py-2 pr-3 font-semibold">Invitado</th>
                <th className="text-left py-2 pr-3 font-semibold">Acompañantes</th>
                <th className="text-left py-2 pr-3 font-semibold">Restricciones</th>
                <th className="text-left py-2 font-semibold">Canción</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest._id} className="border-b break-inside-avoid" style={{ borderColor: '#e7e1d6' }}>
                  <td className="py-2.5 pr-3 font-medium align-top">{guest.name}</td>
                  <td className="py-2.5 pr-3 text-neutral-600 align-top">
                    {guest.companionsCount > 0
                      ? guest.companionNames?.filter(Boolean).length > 0
                        ? guest.companionNames.filter(Boolean).join(', ')
                        : `${guest.companionsCount}`
                      : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-neutral-500 align-top">{guest.dietaryRestrictions || '—'}</td>
                  <td className="py-2.5 text-neutral-500 align-top">{guest.songRequest || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>,
    document.body
  )
}

export default GuestsPrintView
