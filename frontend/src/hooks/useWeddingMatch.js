import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import socket from '../services/socket'
import { uploadMatchSelfie } from '../utils/matchUpload'
import { readMatchToken, writeMatchToken, clearMatchToken } from '../utils/weddingMatch'

// Todo el estado y las llamadas a la API en un solo lugar -- la página
// (WeddingMatch.jsx) queda presentacional, mismo criterio que
// useTableOrganizer.js/usePlaylistOrganizer.
function useWeddingMatch(eventSlug) {
  // loading -> module-off | onboarding | blocked | ready | error
  const [phase, setPhase] = useState('loading')
  const [event, setEvent] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ participants: 0, matches: 0 })
  const [grid, setGrid] = useState([])
  const [gridLoading, setGridLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [celebration, setCelebration] = useState(null)

  function authHeaders() {
    const token = readMatchToken(eventSlug)
    return token ? { 'x-match-token': token } : {}
  }

  const loadGrid = useCallback(async () => {
    setGridLoading(true)
    try {
      const { data } = await api.get(`/match/${eventSlug}/grid`, { headers: authHeaders() })
      setGrid(data.grid)
    } catch {
      // el estado vacío/anterior se mantiene -- no hace falta un error global por esto.
    } finally {
      setGridLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug])

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true)
    try {
      const { data } = await api.get(`/match/${eventSlug}/matches`, { headers: authHeaders() })
      setMatches(data.matches)
    } catch {
      // ídem arriba.
    } finally {
      setMatchesLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const { data: eventData } = await api.get(`/events/slug/${eventSlug}`)
        if (cancelled) return
        setEvent(eventData)

        if (!eventData.activeModules?.weddingMatch) {
          setPhase('module-off')
          return
        }

        const { data: statsData } = await api.get(`/match/${eventSlug}/stats`)
        if (cancelled) return
        setStats({ participants: statsData.participants, matches: statsData.matches })

        const token = readMatchToken(eventSlug)
        if (!token) {
          setPhase('onboarding')
          return
        }

        const { data: meData } = await api.get(`/match/${eventSlug}/me`, { headers: { 'x-match-token': token } })
        if (cancelled) return
        if (!meData.profile) {
          clearMatchToken(eventSlug)
          setPhase('onboarding')
          return
        }
        setProfile(meData.profile)
        setPhase(meData.blocked ? 'blocked' : 'ready')
      } catch {
        if (!cancelled) setPhase('error')
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [eventSlug])

  useEffect(() => {
    if (phase === 'ready') {
      loadGrid()
      loadMatches()
    }
  }, [phase, loadGrid, loadMatches])

  // Rooms privados de Wedding Match: `match:${eventSlug}` (yo + cualquier
  // otro invitado con token válido, para la grilla/contador en vivo) y
  // `match-profile:${miId}` (solo yo, para notificarme un match aunque no
  // haya sido quien tocó "me gusta" segundo -- ver el comentario de
  // postAction en matchController.js). Reemitir join-match en el evento
  // 'connect' del socket cubre tanto la conexión inicial como una
  // reconexión tras un bache de wifi: los rooms viven en el socket.id del
  // servidor, así que una reconexión los pierde en silencio si no se
  // reemite.
  useEffect(() => {
    if (phase !== 'ready' || !profile) return undefined
    const token = readMatchToken(eventSlug)
    if (!token) return undefined

    function joinMatchRoom() {
      socket.emit('join-match', { eventSlug, token })
    }

    socket.connect()
    joinMatchRoom()
    socket.on('connect', joinMatchRoom)

    function handleProfileJoined({ profile: joined }) {
      if (joined.id === profile.id) return
      setGrid((prev) => (prev.some((p) => p.id === joined.id) ? prev : [...prev, { ...joined, myAction: null, matched: false }]))
    }
    function handleProfileUpdated({ profile: updated }) {
      setGrid((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    }
    function removeFromGrid(profileId) {
      setGrid((prev) => prev.filter((p) => p.id !== profileId))
    }
    function handleProfileRemoved({ profileId }) {
      removeFromGrid(profileId)
    }
    function handleProfileBlocked({ profileId }) {
      removeFromGrid(profileId)
    }
    function handleProfileUnblocked({ profile: unblocked }) {
      if (unblocked.id === profile.id) return
      setGrid((prev) => (prev.some((p) => p.id === unblocked.id) ? prev : [...prev, { ...unblocked, myAction: null, matched: false }]))
    }
    function handleCounters({ participants, matches: matchCount }) {
      setStats({ participants, matches: matchCount })
    }
    function handleMatchMade({ profile: matchedProfile }) {
      setGrid((prev) => prev.map((p) => (p.id === matchedProfile.id ? { ...p, matched: true } : p)))
      setCelebration(matchedProfile)
      loadMatches()
    }
    function handleProfileStatus({ status }) {
      setPhase(status === 'blocked' ? 'blocked' : 'ready')
    }

    socket.on('match-profile-joined', handleProfileJoined)
    socket.on('match-profile-updated', handleProfileUpdated)
    socket.on('match-profile-removed', handleProfileRemoved)
    socket.on('match-profile-blocked', handleProfileBlocked)
    socket.on('match-profile-unblocked', handleProfileUnblocked)
    socket.on('match-counters', handleCounters)
    socket.on('match-made', handleMatchMade)
    socket.on('match-profile-status', handleProfileStatus)

    return () => {
      socket.off('connect', joinMatchRoom)
      socket.off('match-profile-joined', handleProfileJoined)
      socket.off('match-profile-updated', handleProfileUpdated)
      socket.off('match-profile-removed', handleProfileRemoved)
      socket.off('match-profile-blocked', handleProfileBlocked)
      socket.off('match-profile-unblocked', handleProfileUnblocked)
      socket.off('match-counters', handleCounters)
      socket.off('match-made', handleMatchMade)
      socket.off('match-profile-status', handleProfileStatus)
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, profile?.id, eventSlug, loadMatches])

  // Si en cualquier escritura el servidor dice que el perfil está
  // bloqueado o que el token ya no existe, se refleja al toque en vez de
  // dejar que la persona siga tocando botones que van a seguir fallando.
  function handleWriteError(err) {
    const status = err.response?.status
    if (status === 403 && err.response?.data?.code === 'PROFILE_BLOCKED') {
      setPhase('blocked')
      return true
    }
    if (status === 401) {
      clearMatchToken(eventSlug)
      setProfile(null)
      setPhase('onboarding')
      return true
    }
    return false
  }

  async function createProfile(input, file) {
    const { photoUrl, photoPublicId } = await uploadMatchSelfie(eventSlug, file)
    const existingToken = readMatchToken(eventSlug)
    const { data } = await api.post(
      `/match/${eventSlug}/profile`,
      { ...input, photoUrl, photoPublicId },
      existingToken ? { headers: { 'x-match-token': existingToken } } : undefined
    )
    writeMatchToken(eventSlug, data.token)
    setProfile(data.profile)
    setPhase('ready')
  }

  async function updateProfile(input, file) {
    const payload = { ...input }
    if (file) {
      const { photoUrl, photoPublicId } = await uploadMatchSelfie(eventSlug, file)
      payload.photoUrl = photoUrl
      payload.photoPublicId = photoPublicId
    }
    try {
      const { data } = await api.patch(`/match/${eventSlug}/profile`, payload, { headers: authHeaders() })
      setProfile(data.profile)
      return data.profile
    } catch (err) {
      if (handleWriteError(err)) return null
      throw err
    }
  }

  async function deleteProfile() {
    try {
      await api.delete(`/match/${eventSlug}/profile`, { headers: authHeaders() })
    } catch (err) {
      if (!handleWriteError(err)) throw err
      return
    }
    clearMatchToken(eventSlug)
    setProfile(null)
    setGrid([])
    setMatches([])
    setPhase('onboarding')
  }

  async function act(targetProfileId, action) {
    // Avance optimista -- la tarjeta desaparece de la grilla al toque,
    // la llamada real viaja atrás. Si falla, se vuelve a pedir la grilla
    // entera para no dejar un estado local inconsistente.
    setGrid((prev) => prev.map((p) => (p.id === targetProfileId ? { ...p, myAction: action } : p)))
    try {
      const { data } = await api.post(
        `/match/${eventSlug}/action`,
        { targetProfileId, action },
        { headers: authHeaders() }
      )
      if (data.matched) {
        setGrid((prev) => prev.map((p) => (p.id === targetProfileId ? { ...p, matched: true } : p)))
        setCelebration(data.match.profile)
        loadMatches()
      }
      return data
    } catch (err) {
      if (!handleWriteError(err)) {
        loadGrid()
        throw err
      }
      return null
    }
  }

  const likeProfile = (id) => act(id, 'like')
  const passProfile = (id) => act(id, 'pass')

  function dismissCelebration() {
    setCelebration(null)
  }

  return {
    phase,
    event,
    profile,
    stats,
    grid,
    gridLoading,
    matches,
    matchesLoading,
    celebration,
    createProfile,
    updateProfile,
    deleteProfile,
    likeProfile,
    passProfile,
    loadGrid,
    loadMatches,
    dismissCelebration,
  }
}

export default useWeddingMatch
