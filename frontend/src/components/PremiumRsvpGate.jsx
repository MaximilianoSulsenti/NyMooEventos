import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import api from '../services/api'
import RsvpForm from './RsvpForm'
import DuoGuestInfoCard from './DuoGuestInfoCard'
import RsvpStatusCard from './RsvpStatusCard'
import RsvpModalShell from './RsvpModalShell'
import Button from './ui/Button'
import { secondaryTextColor, shadeColor } from '../utils/color'

// Plan premium: si la URL trae ?guest=<passcode> busca directo esa
// invitación; si no, le pide el nombre al invitado y lo busca en la lista
// que cargó el organizador. Recién ahí se desbloquea el RsvpForm de siempre,
// con el nombre fijo y el cupo de acompañantes ya limitado.
function PremiumRsvpGate({ event, primaryColor = '#a855f7', modalBgColor, modalTextColor, dietaryOptions, extraQuestions, onClose }) {
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
          modalBgColor={modalBgColor}
          modalTextColor={modalTextColor}
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
          modalBgColor={modalBgColor}
          modalTextColor={modalTextColor}
          onClose={onClose}
        />
      )
    }

    return (
      <RsvpForm
        eventSlug={event.eventSlug}
        primaryColor={primaryColor}
        modalBgColor={modalBgColor}
        modalTextColor={modalTextColor}
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

  const bg = modalBgColor || '#171717'
  const textColor = modalTextColor || '#ffffff'
  const mutedColor = secondaryTextColor(modalTextColor, '99')
  const inputStyle = { background: shadeColor(bg, 12), color: textColor, borderColor: `${textColor}1a` }

  return (
    <RsvpModalShell accentColor={primaryColor} bgColor={modalBgColor} textColor={modalTextColor} onClose={onClose}>
      {status === 'loading' ? (
        <p className="text-center py-8" style={{ color: mutedColor }}>
          Buscando tu invitación...
        </p>
      ) : (
        <form onSubmit={handleSearch} className="space-y-4" style={{ '--accent': primaryColor }}>
          <h2 className="text-xl font-semibold">Confirmar asistencia</h2>
          <p className="text-sm" style={{ color: mutedColor }}>
            Ingresá tu nombre completo, tal como fuiste invitado, para desbloquear tu confirmación.
          </p>
          <div>
            <label className="block text-sm mb-1" style={{ color: mutedColor }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border px-3 py-2 outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              style={inputStyle}
            />
          </div>
          {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
          <Button type="submit" primaryColor={primaryColor} className="w-full">
            <Search className="w-4 h-4" />
            Buscar mi invitación
          </Button>
        </form>
      )}
    </RsvpModalShell>
  )
}

export default PremiumRsvpGate
