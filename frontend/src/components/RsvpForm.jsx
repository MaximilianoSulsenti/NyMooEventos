import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'

const inputClass =
  'w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'

function parseDietaryOptions(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function RsvpForm({ eventSlug, primaryColor = '#a855f7', dietaryOptions, extraQuestions, onClose }) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState('confirmado')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [customDietary, setCustomDietary] = useState('')
  const [companionsCount, setCompanionsCount] = useState(0)
  const [extraAnswers, setExtraAnswers] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const dietaryPresets = parseDietaryOptions(dietaryOptions)
  const questions = Array.isArray(extraQuestions) ? extraQuestions.filter((q) => q.label) : []

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    setStatus('sending')
    setErrorMessage('')

    const finalDietary = dietaryRestrictions === '__otra__' ? customDietary : dietaryRestrictions

    try {
      await api.post('/guests/rsvp', {
        eventSlug,
        name: name.trim(),
        status: attending,
        dietaryRestrictions: finalDietary,
        companionsCount: Number(companionsCount) || 0,
        extraAnswers,
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
        style={{ '--accent': primaryColor }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
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
                {dietaryPresets.length > 0 ? (
                  <>
                    <select
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Ninguna</option>
                      {dietaryPresets.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="__otra__">Otra (especificar)</option>
                    </select>
                    {dietaryRestrictions === '__otra__' && (
                      <input
                        type="text"
                        value={customDietary}
                        onChange={(e) => setCustomDietary(e.target.value)}
                        placeholder="Especificá tu restricción"
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="Opcional"
                    className={inputClass}
                  />
                )}
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

              {questions.map((question, index) => (
                <div key={index}>
                  <label className="block text-sm text-neutral-400 mb-1">{question.label}</label>
                  <input
                    type="text"
                    value={extraAnswers[question.label] || ''}
                    onChange={(e) => setExtraAnswers((prev) => ({ ...prev, [question.label]: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              ))}

              {status === 'error' && <p className="text-red-400 text-sm">{errorMessage}</p>}

              <Button
                type="submit"
                disabled={status === 'sending'}
                primaryColor={primaryColor}
                className="w-full disabled:opacity-40"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar confirmación'}
              </Button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RsvpForm
