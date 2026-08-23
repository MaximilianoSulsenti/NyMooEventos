import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'

// Plan premium: si la URL trae ?guest=<passcode> y el evento tiene ese plan
// activo, resuelve los datos de ESE invitado puntual (nombre + cupo) para
// personalizar la portada y prellenar el RSVP. No hace nada en los otros
// planes ni si falta el parámetro en la URL.
function usePremiumGuest(event) {
  const [searchParams] = useSearchParams()
  const passcode = searchParams.get('guest')
  const [guest, setGuest] = useState(null)

  const enabled = Boolean(passcode) && event?.rsvpSettings?.rsvpType === 'premium_personalizado'

  useEffect(() => {
    if (!enabled) return undefined
    let isMounted = true

    api
      .get(`/guests/lookup/${event.eventSlug}/${passcode}`)
      .then(({ data }) => {
        if (isMounted) setGuest(data)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [enabled, passcode, event?.eventSlug])

  return guest
}

export default usePremiumGuest
