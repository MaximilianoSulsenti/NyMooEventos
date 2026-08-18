import { useState } from 'react'
import api from '../services/api'

function RsvpForm({ eventSlug, onClose }) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState('confirmado')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [companionsCount, setCompanionsCount] = useState(0)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    setStatus('sending')
    setErrorMessage('')

    try {
      await api.post('/guests/rsvp', {
        eventSlug,
        name: name.trim(),
        status: attending,
        dietaryRestrictions,
        companionsCount: Number(companionsCount) || 0,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err.response?.data?.message || 'No se pudo enviar tu confirmación'
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xl font-medium">¡Gracias, {name}!</p>
            <p className="text-neutral-400">Tu confirmación fue registrada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Confirmar asistencia</h2>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">¿Asistís?</label>
              <select
                value={attending}
                onChange={(e) => setAttending(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="confirmado">Sí, voy a asistir</option>
                <option value="declinado">No podré asistir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Alergias o restricciones alimentarias
              </label>
              <input
                type="text"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Cantidad de acompañantes</label>
              <input
                type="number"
                min="0"
                value={companionsCount}
                onChange={(e) => setCompanionsCount(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {status === 'error' && <p className="text-red-400 text-sm">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-2 rounded-full bg-purple-600 disabled:opacity-40 transition"
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar confirmación'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default RsvpForm
