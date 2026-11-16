import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import QrCode from './QrCode'
import CopyField from './CopyField'
import api from '../../services/api'

function RegenerateTokenButton({ eventId, onTokenRegenerated }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setConfirming(false)
    setLoading(true)
    try {
      const { data } = await api.post(`/events/${eventId}/regenerate-token`)
      onTokenRegenerated?.(data.clientAccessToken)
    } catch {
      // Si falla, los links de abajo simplemente no cambian -- el usuario puede reintentar.
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition shrink-0 disabled:opacity-60 ${
        confirming ? 'bg-red-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {confirming ? '¿Seguro? Esto invalida todos los links de arriba' : 'Regenerar link'}
    </button>
  )
}

function QuickAccessLinks({
  eventId,
  eventSlug,
  clientAccessToken,
  tableOrganizerEnabled,
  playlistOrganizerEnabled,
  smartAgendaEnabled,
  weddingMatchEnabled,
  onTokenRegenerated,
}) {
  const origin = window.location.origin
  // encodeURIComponent es necesario porque hay eventos viejos con espacios
  // u otros caracteres en el slug -- sin esto, al pegar el link en WhatsApp
  // el mensaje se corta justo ahí y el link queda roto (404).
  const slug = encodeURIComponent(eventSlug)
  const token = encodeURIComponent(clientAccessToken)
  const cardUrl = `${origin}/evento/${slug}`
  const liveFeedUrl = `${origin}/evento/${slug}/live-feed`
  const uploadUrl = `${origin}/evento/${slug}/upload`
  const statsUrl = `${origin}/evento/${slug}/stats-dashboard?token=${token}`
  const galleryControlUrl = `${origin}/evento/${slug}/gallery-control?token=${token}`
  const tablesUrl = `${origin}/evento/${slug}/mesas?token=${token}`
  const playlistUrl = `${origin}/evento/${slug}/playlist?token=${token}`
  const agendaUrl = `${origin}/evento/${slug}/agenda?token=${token}`
  // Sin token -- a diferencia de los otros módulos, este link lo escanean
  // decenas de invitados distintos (es el target del QR), no un solo
  // cliente con su link exclusivo.
  const matchUrl = `${origin}/evento/${slug}/match`
  const matchPanelUrl = `${origin}/evento/${slug}/match-panel?token=${token}`

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <CopyField label="Tarjeta digital" url={cardUrl} />
          <CopyField label="Pantalla en vivo" url={liveFeedUrl} />
          <CopyField label="Subir fotos (por si el QR falla)" url={uploadUrl} />
        </div>
        <div className="flex justify-center md:justify-end">
          <QrCode value={uploadUrl} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <p className="text-white/40 text-sm">
            Links exclusivos para el cliente (sin necesidad de iniciar sesión):
          </p>
          {eventId && <RegenerateTokenButton eventId={eventId} onTokenRegenerated={onTokenRegenerated} />}
        </div>
        <CopyField label="Panel de estadísticas del cliente" url={statsUrl} />
        <CopyField label="Panel de moderación de galería" url={galleryControlUrl} />
        {tableOrganizerEnabled && <CopyField label="Organizador de mesas" url={tablesUrl} />}
        {playlistOrganizerEnabled && <CopyField label="Planificador de playlist" url={playlistUrl} />}
        {smartAgendaEnabled && <CopyField label="Agenda inteligente" url={agendaUrl} />}
      </div>

      {weddingMatchEnabled && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <CopyField label="Wedding Match (QR para los invitados solteros)" url={matchUrl} />
            <CopyField label="Panel de moderación de Wedding Match" url={matchPanelUrl} />
          </div>
          <div className="flex justify-center md:justify-end">
            <QrCode value={matchUrl} filename="qr-wedding-match.png" />
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickAccessLinks
