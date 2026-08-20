import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import api from '../services/api'
import { cn } from '../utils/cn'

const inputClass =
  'w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40'

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
      setErrorMessage(err.response?.data?.message || 'No se pudo enviar tu confirmación')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-xl border border-white/10"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center space-y-2"
            >
              <p className="text-xl font-medium">¡Gracias, {name}!</p>
              <p className="text-neutral-400">Tu confirmación fue registrada.</p>
            </motion.div>
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
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">¿Asistís?</label>
                <select value={attending} onChange={(e) => setAttending(e.target.value)} className={inputClass}>
                  <option value="confirmado">Sí, voy a asistir</option>
                  <option value="declinado">No podré asistir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Alergias o restricciones alimentarias</label>
                <input
                  type="text"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Cantidad de acompañantes</label>
                <input
                  type="number"
                  min="0"
                  value={companionsCount}
                  onChange={(e) => setCompanionsCount(e.target.value)}
                  className={inputClass}
                />
              </div>

              {status === 'error' && <p className="text-red-400 text-sm">{errorMessage}</p>}

              <motion.button
                type="submit"
                disabled={status === 'sending'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full py-2.5 rounded-full bg-purple-600 font-medium shadow-lg shadow-purple-600/20 transition-colors',
                  status === 'sending' && 'opacity-40'
                )}
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar confirmación'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RsvpForm
