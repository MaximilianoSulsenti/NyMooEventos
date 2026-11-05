import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import { sortNamesEs } from '../../utils/tableOrganizer'

// Portal a document.body (mismo motivo que RsvpModalShell.jsx) -- sin esto
// esta vista queda anidada DENTRO de la página del organizador, que sigue
// ahí en el DOM (solo tapada visualmente por el fixed+z-50 de acá arriba).
// En @media print eso importa de verdad: aunque se la oculte con
// visibility:hidden, un elemento oculto así sigue ocupando su alto normal
// -- toda esa página de atrás (banco de invitados, formulario de mesas,
// etc.) empujaba el contenido real varias hojas en blanco hacia abajo
// antes de que empezara a imprimirse algo. Con el portal, esta vista es
// hermana de #root (no está adentro), así que alcanza con ocultar #root
// entero para imprimir y acá no queda nada invisible ocupando lugar.
function TablesPrintView({ eventName, tables, onClose }) {
  const sortedTables = [...tables].sort((a, b) => a.tableNumber - b.tableNumber)

  return createPortal(
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto" style={{ background: '#f7f3ec' }}>
      <style>{`
        @media print {
          #root { display: none !important; }
          /* El portal ya saca esta vista de la página de atrás, pero el
             div sigue siendo fixed+overflow-y-auto para la pantalla -- eso
             solo, sin esto, clava el contenido a una sola hoja (lo que
             entra en un viewport) en vez de dejarlo fluir y repartirse en
             tantas hojas como haga falta. */
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

      <div className="tables-print-area max-w-3xl mx-auto px-6 py-16" style={{ color: '#1c1917' }}>
        <h1 className="text-3xl font-bold mb-1 text-center">{eventName}</h1>
        <p className="text-center text-neutral-500 text-sm mb-10">Distribución de mesas</p>

        {sortedTables.length === 0 ? (
          <p className="text-center text-neutral-400">Todavía no hay mesas creadas.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {sortedTables.map((table) => {
              const sortedGuests = sortNamesEs(table.assignedGuests)
              return (
                <div
                  key={table.tableNumber}
                  className="rounded-2xl border p-5 break-inside-avoid"
                  style={{ borderColor: '#e7e1d6', background: '#fffdfa' }}
                >
                  <p className="font-semibold text-lg mb-0.5">{table.tableName}</p>
                  <p className="text-neutral-400 text-xs mb-3">
                    {table.hideNumber ? '' : `Mesa ${table.tableNumber} · `}
                    {table.assignedGuests.length}/{table.maxSeats}
                  </p>
                  {sortedGuests.length === 0 ? (
                    <p className="text-neutral-400 text-sm">Sin invitados asignados</p>
                  ) : (
                    <ol className="space-y-1 list-decimal list-inside text-sm text-neutral-700">
                      {sortedGuests.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ol>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default TablesPrintView
