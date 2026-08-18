const STATUS_STYLES = {
  confirmado: 'bg-green-500/15 text-green-400',
  declinado: 'bg-red-500/15 text-red-400',
  pendiente: 'bg-yellow-500/15 text-yellow-400',
}

function GuestsTable({ guests }) {
  if (guests.length === 0) {
    return (
      <div className="rounded-xl bg-neutral-900 border border-white/10 p-6 text-center text-neutral-400">
        Todavía no hay invitados registrados.
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-neutral-400 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Acompañantes</th>
            <th className="px-4 py-3 font-medium">Restricciones</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr key={guest._id} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3">{guest.name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLES[guest.status] || ''}`}>
                  {guest.status}
                </span>
              </td>
              <td className="px-4 py-3">{guest.companionsCount}</td>
              <td className="px-4 py-3 text-neutral-400">{guest.dietaryRestrictions || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GuestsTable
