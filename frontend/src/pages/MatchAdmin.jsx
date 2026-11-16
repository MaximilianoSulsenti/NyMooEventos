import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, Heart, Sparkles, Users, UserX, HeartHandshake, ThumbsUp, Ban, RotateCcw, Trash2 } from 'lucide-react'
import api from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import CopyField from '../components/dashboard/CopyField'
import QrCode from '../components/dashboard/QrCode'
import { BRAND } from '../utils/brand'

// Mismo recurso que TableOrganizer.jsx/SmartAgenda.jsx (posiciones y
// tiempos fijos, nada de Math.random en el render), con vocabulario propio
// de este panel: corazones y brillos en vez de sillas/copas.
const FLOATING_ICONS = [
  { Icon: Heart, top: '10%', left: '6%', size: 28, duration: 10, delay: 0, color: BRAND.pink },
  { Icon: Sparkles, top: '18%', left: '90%', size: 24, duration: 12, delay: 1.2, color: BRAND.violet },
  { Icon: Heart, top: '72%', left: '8%', size: 24, duration: 11, delay: 0.8, color: BRAND.violet },
  { Icon: Sparkles, top: '84%', left: '88%', size: 22, duration: 13, delay: 2, color: BRAND.pink },
]

// Dos formas de llegar acá, mismo patrón que TableOrganizer.jsx:
// /dashboard/:eventId/match (dueño logueado) o
// /evento/:eventSlug/match-panel?token=... (link del cliente, sin login).
function MatchAdmin() {
  const { eventId, eventSlug: eventSlugParam } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isClientMode = Boolean(eventSlugParam)

  const [loadState, setLoadState] = useState('loading') // loading | ready | forbidden | error
  const [data, setData] = useState(null)
  const [actionError, setActionError] = useState('')
  const [pendingId, setPendingId] = useState(null)

  async function load() {
    try {
      if (isClientMode) {
        if (!token) {
          setLoadState('forbidden')
          return
        }
        const { data: res } = await api.get(`/match/client/${eventSlugParam}/admin`, { params: { token } })
        setData(res)
      } else {
        const { data: res } = await api.get(`/match/event/${eventId}/admin`)
        setData(res)
      }
      setLoadState('ready')
    } catch (err) {
      const status = err.response?.status
      setLoadState(status === 403 || status === 404 ? 'forbidden' : 'error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, eventSlugParam, token])

  async function handleStatus(profileId, status) {
    setActionError('')
    setPendingId(profileId)
    try {
      if (isClientMode) {
        await api.patch(`/match/client/${eventSlugParam}/profiles/${profileId}/status`, { status }, { params: { token } })
      } else {
        await api.patch(`/match/event/${eventId}/profiles/${profileId}/status`, { status })
      }
      await load()
    } catch (err) {
      setActionError(err.response?.data?.message || 'No se pudo actualizar el perfil')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(profileId) {
    setActionError('')
    setPendingId(profileId)
    try {
      if (isClientMode) {
        await api.delete(`/match/client/${eventSlugParam}/profiles/${profileId}`, { params: { token } })
      } else {
        await api.delete(`/match/event/${eventId}/profiles/${profileId}`)
      }
      await load()
    } catch (err) {
      setActionError(err.response?.data?.message || 'No se pudo eliminar el perfil')
    } finally {
      setPendingId(null)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.night }}>
        <p className="text-white/40">Cargando...</p>
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ background: BRAND.night }}>
        <p className="text-white/40">
          {isClientMode ? 'Este link no es válido, o Wedding Match todavía no está activo para este evento.' : 'No tenés permiso para ver este panel.'}
        </p>
      </div>
    )
  }

  if (loadState === 'error' || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.night }}>
        <p className="text-red-400">Ocurrió un error al cargar el panel.</p>
      </div>
    )
  }

  const origin = window.location.origin
  const slug = encodeURIComponent(data.eventSlug)
  const matchUrl = `${origin}/evento/${slug}/match`
  const activeProfiles = data.profiles.filter((p) => p.status === 'active')
  const blockedProfiles = data.profiles.filter((p) => p.status === 'blocked')

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: BRAND.night }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.pink}26, transparent 70%)` }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-16 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BRAND.violet}22, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {FLOATING_ICONS.map(({ Icon, top, left, size, duration, delay, color }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top, left, color, opacity: 0.08 }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon width={size} height={size} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          {!isClientMode && (
            <Link
              to={`/dashboard/${eventId}`}
              className="flex items-center gap-1 text-white/40 text-xs uppercase tracking-widest hover:text-white transition mb-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Volver al panel
            </Link>
          )}
          <h1 className="font-modern tracking-tight text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
            <motion.span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND.pink}33, ${BRAND.violet}22)` }}
              animate={{ boxShadow: [`0 0 0 1px ${BRAND.pink}55`, `0 0 0 5px ${BRAND.pink}15`, `0 0 0 1px ${BRAND.pink}55`] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-4 h-4" style={{ color: BRAND.pink }} />
            </motion.span>
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.violet})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Wedding Match
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">{data.eventName}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Solteros activos" value={data.stats.profiles - data.stats.blocked} icon={Users} iconColor={BRAND.pink} />
          <StatCard label="Bloqueados" value={data.stats.blocked} icon={UserX} iconColor={BRAND.orange} />
          <StatCard label="Me gusta enviados" value={data.stats.likes} icon={ThumbsUp} iconColor={BRAND.violet} />
          <StatCard label="Matches" value={data.stats.matches} icon={HeartHandshake} iconColor={BRAND.lime} />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-4 justify-center">
            <CopyField label="Link para compartir / QR para imprimir" url={matchUrl} />
            <p className="text-white/30 text-xs">
              Pegalo en una cartelería o en cada mesa para que los invitados solteros escaneen y se registren durante la fiesta.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <QrCode value={matchUrl} filename="qr-wedding-match.png" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-white/40" />
              Perfiles ({data.profiles.length})
            </h2>
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
          </div>

          {data.profiles.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-10 text-center text-white/40">
              Todavía no se registró ningún soltero -- compartí el QR de arriba para que empiecen a sumarse.
            </div>
          ) : (
            <div className="space-y-2">
              {[...activeProfiles, ...blockedProfiles].map((profile) => (
                <ProfileRow
                  key={profile.id}
                  profile={profile}
                  pending={pendingId === profile.id}
                  onBlock={() => handleStatus(profile.id, 'blocked')}
                  onUnblock={() => handleStatus(profile.id, 'active')}
                  onDelete={() => handleDelete(profile.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ profile, pending, onBlock, onUnblock, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 3000)
      return
    }
    setConfirmingDelete(false)
    onDelete()
  }

  const blocked = profile.status === 'blocked'

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
        blocked ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'
      }`}
    >
      <img
        src={profile.photoUrl}
        alt={profile.name}
        className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">
          {profile.name}, {profile.age}
        </p>
        <p className="text-white/40 text-xs">
          {blocked ? 'Bloqueado' : 'Activo'} {profile.hasWhatsapp ? '· dejó WhatsApp' : '· sin WhatsApp'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {blocked ? (
          <button
            type="button"
            onClick={onUnblock}
            disabled={pending}
            title="Desbloquear"
            className="p-2 rounded-lg text-white/40 hover:text-lime-400 hover:bg-lime-500/10 transition disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onBlock}
            disabled={pending}
            title="Bloquear (foto o contenido inapropiado)"
            className="p-2 rounded-lg text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={pending}
          title="Eliminar definitivamente"
          className={`flex items-center gap-1 p-2 rounded-lg transition disabled:opacity-50 ${
            confirmingDelete ? 'bg-red-600 text-white px-2.5' : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          {confirmingDelete && <span className="text-xs whitespace-nowrap">¿Seguro?</span>}
        </button>
      </div>
    </div>
  )
}

export default MatchAdmin
