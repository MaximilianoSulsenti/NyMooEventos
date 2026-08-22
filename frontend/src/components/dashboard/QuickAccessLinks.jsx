import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import QrCode from './QrCode'
import { BRAND } from '../../utils/brand'
import { getContrastTextColor } from '../../utils/color'

function CopyField({ label, url }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/70 outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl transition text-sm font-medium shrink-0 hover:brightness-110"
          style={{
            background: copied ? BRAND.lime : `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.violet})`,
            color: copied ? getContrastTextColor(BRAND.lime) : '#ffffff',
          }}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Abrir ${label} en una pestaña nueva`}
          title="Abrir en una pestaña nueva"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

function QuickAccessLinks({ eventSlug, clientAccessToken }) {
  const origin = window.location.origin
  const cardUrl = `${origin}/evento/${eventSlug}`
  const liveFeedUrl = `${origin}/evento/${eventSlug}/live-feed`
  const uploadUrl = `${origin}/evento/${eventSlug}/upload`
  const statsUrl = `${origin}/evento/${eventSlug}/stats-dashboard?token=${clientAccessToken}`
  const galleryControlUrl = `${origin}/evento/${eventSlug}/gallery-control?token=${clientAccessToken}`

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <CopyField label="Tarjeta digital" url={cardUrl} />
          <CopyField label="Pantalla en vivo" url={liveFeedUrl} />
          <CopyField label="Subir fotos (por si el QR falla)" url={uploadUrl} />
        </div>
        <div className="flex justify-center md:justify-end">
          <QrCode value={uploadUrl} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-4">
        <p className="text-white/40 text-sm">
          Links exclusivos para el cliente (sin necesidad de iniciar sesión):
        </p>
        <CopyField label="Panel de estadísticas del cliente" url={statsUrl} />
        <CopyField label="Panel de moderación de galería" url={galleryControlUrl} />
      </div>
    </div>
  )
}

export default QuickAccessLinks
