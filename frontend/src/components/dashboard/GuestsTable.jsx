import { Fragment, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const STATUS_STYLES = {
  confirmado: 'bg-green-500/15 text-green-400',
  declinado: 'bg-red-500/15 text-red-400',
  pendiente: 'bg-yellow-500/15 text-yellow-400',
}

function GuestsTable({ guests }) {
  const [expandedId, setExpandedId] = useState(null)

  if (guests.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center text-white/50">
        Todavía no hay invitados registrados.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-white/50 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Acompañantes</th>
            <th className="px-4 py-3 font-medium">Restricciones</th>
            <th className="px-4 py-3 font-medium">Canción</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => {
            const extraEntries = Object.entries(guest.extraAnswers || {}).filter(([, value]) => value)
            const isExpanded = expandedId === guest._id

            return (
              <Fragment key={guest._id}>
                <tr className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{guest.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLES[guest.status] || ''}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{guest.companionsCount}</td>
                  <td className="px-4 py-3 text-neutral-400">{guest.dietaryRestrictions || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 max-w-[160px] truncate">{guest.songRequest || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {extraEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : guest._id)}
                        className="text-neutral-500 hover:text-white transition inline-flex items-center gap-1 text-xs"
                      >
                        Detalle
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && extraEntries.length > 0 && (
                  <tr className="border-b border-white/5 last:border-0 bg-black/20">
                    <td colSpan={6} className="px-4 py-3">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        {extraEntries.map(([question, answer]) => (
                          <div key={question} className="flex gap-2">
                            <dt className="text-neutral-500">{question}:</dt>
                            <dd className="text-neutral-300">{answer}</dd>
                          </div>
                        ))}
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default GuestsTable
