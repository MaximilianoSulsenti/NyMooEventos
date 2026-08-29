import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Search } from 'lucide-react'
import api from '../services/api'
import RsvpForm from './RsvpForm'
import DuoGuestInfoCard from './DuoGuestInfoCard'
import RsvpStatusCard from './RsvpStatusCard'
import Button from './ui/Button'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

const inputClass =
  'w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'

// Plan premium: si la URL trae ?guest=<passcode> busca directo esa
// invitación; si no, le pide el nombre al invitado y lo busca en la lista
// que cargó el organizador. Recién ahí se desbloquea el RsvpForm de siempre,
// con el nombre fijo y el cupo de acompañantes ya limitado.
function PremiumRsvpGate({ event, primaryColor = '#a855f7', dietaryOptions, extraQuestions, onClose }) {
  const [searchParams] = useSearchParams()
  const passcode = searchParams.get('guest')
  const [guest, setGuest] = useState(null)
  const [status, setStatus] = useState(passcode ? 'loading' : 'searching') // loading | searching | found | error
  const [searchName, setSearchName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!passcode) return
    api
      .get(`/guests/lookup/${event.eventSlug}/${passcode}`)
      .then(({ data }) => {
        setGuest(data)
        setStatus('found')
      })
      .catch(() => {
        setErrorMessage('No encontramos tu invitación con este link. Buscá tu nombre para confirmar igual.')
        setStatus('searching')
      })
  }, [passcode, event.eventSlug])

  async function handleSearch(searchEvent) {
    searchEvent.preventDefault()
    if (!searchName.trim()) return

    setStatus('loading')
    setErrorMessage('')
    try {
      const { data } = await api.get(`/guests/search/${event.eventSlug}`, { params: { name: searchName.trim() } })
      setGuest(data)
      setStatus('found')
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'No te encontramos en la lista de invitados')
      setStatus('searching')
    }
  }

  if (status === 'found' && guest) {
    // Invitación Dúo de un original con invitaciones VIP: el invitado ya
    // confirmó su asistencia en la invitación principal, así que acá no se
    // le vuelve a pedir RSVP -- se le muestra la info que cargó el
    // organizador en su lugar (ver rsvpSettings.duoInfoDescription).
    if (event.isDuo) {
      return (
        <DuoGuestInfoCard
          guestName={guest.name}
          title={event.duoLabel || 'Información'}
          description={event.rsvpSettings?.duoInfoDescription}
          primaryColor={primaryColor}
          onClose={onClose}
        />
      )
    }
    // Si ya respondió (confirmado o declinado), no lo mandamos de nuevo al
    // formulario -- eso lo dejaría reescribir su RSVP cada vez que entra a
    // su link. En cambio ve una pantalla fija con lo que ya quedó
    // registrado.
    if (guest.status && guest.status !== 'pendiente') {
      return (
        <RsvpStatusCard
          guestName={guest.name}
          status={guest.status}
          companionNames={guest.companionNames}
          primaryColor={primaryColor}
          onClose={onClose}
        />
      )
    }

    return (
      <RsvpForm
        eventSlug={event.eventSlug}
        primaryColor={primaryColor}
        dietaryOptions={dietaryOptions}
        extraQuestions={extraQuestions}
        onClose={onClose}
        guestId={guest._id}
        lockedName={guest.name}
        maxCompanions={guest.maxCompanionsAllowed}
        initialCompanionNames={guest.companionNames}
      />
    )
  }

  const light = shadeColor(primaryColor, 25)
  const dark = shadeColor(primaryColor, -25)

  return (
    <AnimatePresence>
      <GateShell onClose={onClose} light={light} dark={dark}>
        {status === 'loading' ? (
          <p className="text-center text-neutral-400 py-8">Buscando tu invitación...</p>
        ) : (
          <form onSubmit={handleSearch} className="space-y-4" style={{ '--accent': primaryColor }}>
            <h2 className="text-xl font-semibold">Confirmar asistencia</h2>
            <p className="text-neutral-400 text-sm">
              Ingresá tu nombre completo, tal como fuiste invitado, para desbloquear tu confirmación.
            </p>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nombre completo</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                required
                autoFocus
                className={inputClass}
              />
            </div>
            {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
            <Button type="submit" primaryColor={primaryColor} className="w-full">
              <Search className="w-4 h-4" />
              Buscar mi invitación
            </Button>
          </form>
        )}
      </GateShell>
    </AnimatePresence>
  )
}

// Mismo "chrome" de modal que el resto de la app (fondo con blur, tarjeta
// con borde en degradado, botón de cerrar) para que se sienta consistente.
function GateShell({ children, onClose, light, dark }) {
  useLockBodyScroll()
  return (
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
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PremiumRsvpGate
