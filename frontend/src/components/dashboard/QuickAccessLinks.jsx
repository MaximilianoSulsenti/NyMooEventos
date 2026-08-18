import { useState } from 'react'
import QrCode from './QrCode'

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
      <p className="text-neutral-400 text-sm mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-300 outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-sm font-medium shrink-0"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

function QuickAccessLinks({ eventSlug }) {
  const origin = window.location.origin
  const cardUrl = `${origin}/evento/${eventSlug}`
  const liveFeedUrl = `${origin}/evento/${eventSlug}/live-feed`
  const uploadUrl = `${origin}/evento/${eventSlug}/upload`

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-5 flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <CopyField label="Tarjeta digital" url={cardUrl} />
        <CopyField label="Pantalla en vivo" url={liveFeedUrl} />
      </div>
      <div className="flex justify-center md:justify-end">
        <QrCode value={uploadUrl} />
      </div>
    </div>
  )
}

export default QuickAccessLinks
