import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { X, Check, Lock, Plus } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'
import RsvpModalShell from './RsvpModalShell'
import { shadeColor, secondaryTextColor } from '../utils/color'

const inputBaseClass =
  'w-full rounded-lg border px-3 py-2 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'

// Si el organizador no cargó sus propias opciones en el editor (campo
// "Opciones de restricciones alimentarias" de la sección RSVP), el
// desplegable arranca con estas por defecto en vez de caer a un input de
// texto libre -- cubren los casos más comunes sin que haya que configurar
// nada. "Ninguna" ya está siempre como primera opción del <select>.
const DEFAULT_DIETARY_OPTIONS = ['Vegano', 'Vegetariano', 'Celíaco', 'Diabético', 'Hipertenso', 'Intolerante a la lactosa']

function parseDietaryOptions(raw = '') {
  const custom = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return custom.length > 0 ? custom : DEFAULT_DIETARY_OPTIONS
}

// Plan básico: arma el texto del mensaje con todo lo que completó el
// invitado (nombre, asistencia, acompañantes, restricciones, preguntas
// extra) para que llegue prolijo al WhatsApp del cliente -- nada de esto se
// guarda en la base, es solo texto para el mensaje.
function buildWhatsappMessage({ eventName, template, name, attending, dietaryRestrictions, companionNames, extraAnswers }) {
  const intro = template?.trim() || `¡Hola! Quiero confirmar mi asistencia para el evento ${eventName}.`
  const companionsLine =
    companionNames.length > 0 ? `Acompañantes (${companionNames.length}): ${companionNames.join(', ')}` : 'Acompañantes: 0'
  const lines = [
    intro,
    '',
    `Nombre: ${name}`,
    `Asistencia: ${attending === 'confirmado' ? 'Sí, voy a asistir' : 'No podré asistir'}`,
    companionsLine,
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
  modalBgColor,
  modalTextColor,
  dietaryOptions,
  extraQuestions,
  onClose,
  guestId,
  lockedName,
  maxCompanions,
  initialCompanionNames,
  mode = 'save', // 'save' (plan intermedio/premium) | 'whatsapp' (plan básico)
  eventName,
  whatsappNumber,
  whatsappMessage,
}) {
  const [name, setName] = useState(lockedName || '')
  const [attending, setAttending] = useState('confirmado')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [customDietary, setCustomDietary] = useState('')
  // VIP (maxCompanions viene de su cupo asignado): arranca con esa cantidad
  // exacta de campos fijos, precargados si ya los había completado antes.
  // Sin VIP: arranca vacío (o con lo que ya había cargado), los va
  // agregando de a uno con el botón de abajo.
  const [companionNames, setCompanionNames] = useState(() => {
    const initial = Array.isArray(initialCompanionNames) ? initialCompanionNames : []
    if (maxCompanions == null) return initial
    return Array.from({ length: maxCompanions }, (_, i) => initial[i] || '')
  })
  const [extraAnswers, setExtraAnswers] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  // Después de confirmar, el modal se cierra solo para que se vuelva a ver
  // la invitación -- antes se quedaba trabado en la pantalla de "gracias"
  // hasta que alguien tocara la X a propósito.
  useEffect(() => {
    if (status !== 'success') return undefined
    const timeout = setTimeout(onClose, 3500)
    return () => clearTimeout(timeout)
  }, [status, onClose])

  const dietaryPresets = parseDietaryOptions(dietaryOptions)
  const questions = Array.isArray(extraQuestions) ? extraQuestions.filter((q) => q.label) : []
  const bg = modalBgColor || '#171717'
  const textColor = modalTextColor || '#ffffff'
  const mutedColor = secondaryTextColor(modalTextColor, '99')
  const inputBg = shadeColor(bg, 12)
  const inputStyle = { background: inputBg, color: textColor, borderColor: `${textColor}1a` }

  function updateCompanionName(index, value) {
    setCompanionNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }
  function addCompanion() {
    setCompanionNames((prev) => [...prev, ''])
  }
  function removeCompanion(index) {
    setCompanionNames((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    const finalDietary = dietaryRestrictions === '__otra__' ? customDietary : dietaryRestrictions
    const finalCompanionNames = companionNames.map((n) => n.trim()).filter(Boolean)

    if (mode === 'whatsapp') {
      const message = buildWhatsappMessage({
        eventName,
        template: whatsappMessage,
        name: name.trim(),
        attending,
        dietaryRestrictions: finalDietary,
        companionNames: finalCompanionNames,
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
        companionsCount: finalCompanionNames.length,
        companionNames: finalCompanionNames,
        extraAnswers,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.response?.data?.message || 'No se pudo enviar tu confirmación')
    }
  }

  return (
    <RsvpModalShell accentColor={primaryColor} bgColor={modalBgColor} textColor={modalTextColor} onClose={onClose}>
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
          <p style={{ color: mutedColor }}>
            {mode === 'whatsapp'
              ? 'Se abrió WhatsApp con tu mensaje listo -- enviálo para confirmar tu asistencia.'
              : attending === 'confirmado'
                ? '¡Genial! Registramos tu asistencia -- te esperamos en el evento.'
                : 'Registramos que no vas a poder acompañarnos. ¡Gracias por avisarnos!'}
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" style={{ '--accent': primaryColor }}>
          <h2 className="text-xl font-semibold">Confirmar asistencia</h2>

          <div>
            <label className="block text-sm mb-1" style={{ color: mutedColor }}>
              Nombre completo
            </label>
            {lockedName ? (
              <div
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{ background: `${inputBg}99`, borderColor: `${textColor}1a`, color: mutedColor }}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: mutedColor }} />
                <span className="truncate">{name}</span>
              </div>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputBaseClass}
                style={inputStyle}
              />
            )}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: mutedColor }}>
              ¿Asistís?
            </label>
            <select value={attending} onChange={(e) => setAttending(e.target.value)} className={inputBaseClass} style={inputStyle}>
              <option value="confirmado" style={{ color: '#000' }}>
                Sí, voy a asistir
              </option>
              <option value="declinado" style={{ color: '#000' }}>
                No podré asistir
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: mutedColor }}>
              Alergias o restricciones alimentarias
            </label>
            <select
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              className={inputBaseClass}
              style={inputStyle}
            >
              <option value="" style={{ color: '#000' }}>
                Ninguna
              </option>
              {dietaryPresets.map((option) => (
                <option key={option} value={option} style={{ color: '#000' }}>
                  {option}
                </option>
              ))}
              <option value="__otra__" style={{ color: '#000' }}>
                Otra (especificar)
              </option>
            </select>
            {dietaryRestrictions === '__otra__' && (
              <input
                type="text"
                value={customDietary}
                onChange={(e) => setCustomDietary(e.target.value)}
                placeholder="Especificá tu restricción"
                className={`${inputBaseClass} mt-2`}
                style={inputStyle}
              />
            )}
          </div>

          {(maxCompanions == null || maxCompanions > 0) && (
            <div>
              <label className="block text-sm mb-1" style={{ color: mutedColor }}>
                Acompañantes
                {maxCompanions != null && <span style={{ color: secondaryTextColor(modalTextColor, '80') }}> (cupo: {maxCompanions})</span>}
              </label>
              <div className="space-y-2">
                {companionNames.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateCompanionName(index, e.target.value)}
                      placeholder="Nombre y apellido"
                      className={inputBaseClass}
                      style={inputStyle}
                    />
                    {maxCompanions == null && (
                      <button
                        type="button"
                        onClick={() => removeCompanion(index)}
                        className="shrink-0 hover:text-red-400 transition-colors"
                        style={{ color: secondaryTextColor(modalTextColor, '80') }}
                        aria-label="Quitar acompañante"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {maxCompanions == null && (
                <button
                  type="button"
                  onClick={addCompanion}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors hover:brightness-125"
                  style={{ color: textColor, background: `${textColor}0d`, borderColor: `${textColor}26` }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar acompañante
                </button>
              )}
            </div>
          )}

          {questions.map((question, index) => (
            <div key={index}>
              <label className="block text-sm mb-1" style={{ color: mutedColor }}>
                {question.label}
              </label>
              <input
                type="text"
                value={extraAnswers[question.label] || ''}
                onChange={(e) => setExtraAnswers((prev) => ({ ...prev, [question.label]: e.target.value }))}
                className={inputBaseClass}
                style={inputStyle}
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
    </RsvpModalShell>
  )
}

export default RsvpForm
