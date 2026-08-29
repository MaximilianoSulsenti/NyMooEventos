import { useState } from 'react'

// Un tema vive en un solo lugar a la vez: en el banco (pendiente de
// asignar) o ya movido adentro de un bloque de momento -- a diferencia del
// organizador de mesas (donde el invitado sigue existiendo en el pool
// aunque esté sentado en una mesa), acá "asignar" es mover el tema del
// banco al bloque, porque no tiene sentido que la misma canción suene en
// dos momentos distintos de la fiesta. Por eso no hace falta derivar
// "pendientes" con un Set como en useTableOrganizer: el banco YA es la
// lista de pendientes.
function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function usePlaylistOrganizer(initialSongBank = [], initialMoments = []) {
  const [songBank, setSongBank] = useState(initialSongBank)
  const [moments, setMoments] = useState(initialMoments)

  function loadFromServer(nextSongBank, nextMoments) {
    setSongBank(nextSongBank)
    setMoments(nextMoments)
  }

  // tracks: [{ title, artist, notes, momentType? }] -- viene del import de
  // Excel o del alta manual. Si trae momentType, va directo a ese bloque
  // (creándolo si todavía no existe); si no, cae al banco general.
  function addTracks(tracks) {
    const toBank = []
    const byMoment = new Map()

    tracks.forEach((t) => {
      const title = (t.title || '').trim()
      if (!title) return
      const track = {
        _id: makeLocalId(),
        title,
        artist: (t.artist || '').trim(),
        notes: (t.notes || '').trim(),
      }
      const momentType = (t.momentType || '').trim()
      if (momentType) {
        if (!byMoment.has(momentType)) byMoment.set(momentType, [])
        byMoment.get(momentType).push(track)
      } else {
        toBank.push(track)
      }
    })

    if (toBank.length > 0) {
      setSongBank((prev) => [...prev, ...toBank])
    }
    if (byMoment.size > 0) {
      setMoments((prev) => {
        const next = [...prev]
        byMoment.forEach((newTracks, momentType) => {
          const idx = next.findIndex((m) => m.momentType === momentType)
          if (idx === -1) {
            next.push({ momentType, tracks: newTracks, spotifyUrl: '' })
          } else {
            next[idx] = { ...next[idx], tracks: [...next[idx].tracks, ...newTracks] }
          }
        })
        return next
      })
    }

    return { bankCount: toBank.length, momentCount: [...byMoment.values()].reduce((sum, arr) => sum + arr.length, 0) }
  }

  function addTrackManually({ title, artist, notes }) {
    addTracks([{ title, artist, notes }])
  }

  function removeFromBank(trackId) {
    setSongBank((prev) => prev.filter((t) => t._id !== trackId))
  }

  function addMoment(momentType) {
    const clean = momentType.trim()
    if (!clean) return
    setMoments((prev) =>
      prev.some((m) => m.momentType === clean) ? prev : [...prev, { momentType: clean, tracks: [], spotifyUrl: '' }]
    )
  }

  function deleteMoment(momentType) {
    setMoments((prev) => prev.filter((m) => m.momentType !== momentType))
  }

  // Link de playlist pública de Spotify para ESE bloque puntual (ver
  // MomentCard.jsx) -- independiente del banco de canciones.
  function setMomentSpotifyUrl(momentType, spotifyUrl) {
    setMoments((prev) => prev.map((m) => (m.momentType === momentType ? { ...m, spotifyUrl } : m)))
  }

  // Mueve temas del banco general al bloque -- a diferencia de las mesas
  // (donde asignar no saca al invitado del pool), acá el tema desaparece
  // del banco porque ya "sonó" en ese momento. Lee `songBank` directo del
  // closure (no desde un updater funcional anidado) para evitar dos
  // setState cruzados dentro de un mismo updater, que en Strict Mode de
  // React 18 se puede invocar dos veces y duplicar el movimiento.
  function assignTracksToMoment(momentType, trackIds) {
    const idSet = new Set(trackIds)
    const moving = songBank.filter((t) => idSet.has(t._id))
    if (moving.length === 0) return

    setSongBank((prev) => prev.filter((t) => !idSet.has(t._id)))
    setMoments((prev) => prev.map((m) => (m.momentType === momentType ? { ...m, tracks: [...m.tracks, ...moving] } : m)))
  }

  // Vuelve un tema del bloque al banco general, por si se asignó por error.
  function unassignTrack(momentType, trackId) {
    const moment = moments.find((m) => m.momentType === momentType)
    const track = moment?.tracks.find((t) => t._id === trackId)
    if (!track) return

    setMoments((prev) =>
      prev.map((m) => (m.momentType === momentType ? { ...m, tracks: m.tracks.filter((t) => t._id !== trackId) } : m))
    )
    setSongBank((prev) => [...prev, track])
  }

  function removeTrackFromMoment(momentType, trackId) {
    setMoments((prev) =>
      prev.map((m) => (m.momentType === momentType ? { ...m, tracks: m.tracks.filter((t) => t._id !== trackId) } : m))
    )
  }

  return {
    songBank,
    moments,
    loadFromServer,
    addTracks,
    addTrackManually,
    removeFromBank,
    addMoment,
    deleteMoment,
    setMomentSpotifyUrl,
    assignTracksToMoment,
    unassignTrack,
    removeTrackFromMoment,
  }
}

export default usePlaylistOrganizer
