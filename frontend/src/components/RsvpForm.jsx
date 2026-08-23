import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check, Lock } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

const inputClass =
  'w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'

function parseDietaryOptions(raw = '') {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// Plan básico: arma el texto del mensaje con todo lo que completó el
// invitado (nombre, asistencia, acompañantes, restricciones, preguntas
// extra) para que llegue prolijo al WhatsApp del cliente -- nada de esto se
// guarda en la base, es solo texto para el mensaje.
function buildWhatsappMessage({ eventName, template, name, attending, dietaryRestrictions, companionsCount, extraAnswers }) {
  const intro = template?.trim() || `¡Hola! Quiero confirmar mi asistencia para el evento ${eventName}.`
  const lines = [
    intro,
    '',
    `Nombre: ${name}`,
    `Asistencia: ${attending === 'confirmado' ? 'Sí, voy a asistir' : 'No podré asistir'}`,
    `Acompañantes: ${companionsCount}`,
    `Restricciones alimentarias: ${dietaryRestrictions || 'Ninguna'}`,
  ]
  Object.entries(extraAnswers || {}).forEach(([question, answer]) => {
    if (answer) lines.push(`${question}: ${answer}`)
  })
  return lines.join('\n')
}

function RsvpForm({
  eventSlug,
  primaryColor = '#a855f7',
  dietaryOptions,
  extraQuestions,
  onClose,
  guestId,
  lockedName,
  maxCompanions,
  mode = 'save', // 'save' (plan intermedio/premium) | 'whatsapp' (plan básico)
  eventName,
  whatsappNumber,
  whatsappMessage,
}) {
  useLockBodyScroll()
  const [name, setName] = useState(lockedName || '')
  const [attending, setAttending] = useState('confirmado')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [customDietary, setCustomDietary] = useState('')
  const [companionsCount, setCompanionsCount] = useState(0)
  const [extraAnswers, setExtraAnswers] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const dietaryPresets = parseDietaryOptions(dietaryOptions)
  const questions = Array.isArray(extraQuestions) ? extraQuestions.filter((q) => q.label) : []
  const light = shadeColor(primaryColor, 25)
  const dark = shadeColor(primaryColor, -25)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    const finalDietary = dietaryRestrictions === '__otra__' ? customDietary : dietaryRestrictions

    if (mode === 'whatsapp') {
      const message = buildWhatsappMessage({
        eventName,
        template: whatsappMessage,
        name: name.trim(),
        attending,
        dietaryRestrictions: finalDietary,
        companionsCount: Number(companionsCount) || 0,
        extraAnswers,
      })
      const digits = (whatsappNumber || '').replace(/\D/g, '')
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
      setStatus('success')
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      await api.post('/guests/rsvp', {
        eventSlug,
        guestId,
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
          className="rounded-3xl p-px w-full max-w-md shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${light}90, transparent 45%, ${dark}70)` }}
        >
        <div className="bg-neutral-900 text-white rounded-[calc(1.5rem-1px)] p-6 relative max-h-[90vh] overflow-y-auto">
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
              className="py-8 text-center space-y-3"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: `${primaryColor}22`, color: primaryColor }}
              >
                <Check className="w-7 h-7" />
              </motion.div>
              <p className="text-xl font-medium">¡Gracias, {name}!</p>
              <p className="text-neutral-400">
                {mode === 'whatsapp'
                  ? 'Se abrió WhatsApp con tu mensaje listo -- enviálo para confirmar tu asistencia.'
                  : 'Tu confirmación fue registrada.'}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold">Confirmar asistencia</h2>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Nombre completo</label>
                {lockedName ? (
                  <div className="flex items-center gap-2 rounded-lg bg-neutral-800/60 border border-white/10 px-3 py-2 text-neutral-300">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                    <span className="truncate">{name}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                  />
                )}
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
                <label className="block text-sm text-neutral-400 mb-1">
                  Cantidad de acompañantes
                  {maxCompanions != null && <span className="text-neutral-500"> (cupo máximo: {maxCompanions})</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxCompanions ?? undefined}
                  value={companionsCount}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setCompanionsCount(maxCompanions != null ? Math.min(value, maxCompanions) : value)
                  }}
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
                {status === 'sending' ? 'Enviando...' : mode === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar confirmación'}
              </Button>
            </form>
          )}
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RsvpForm
