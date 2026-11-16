import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { BRAND } from '../../utils/brand'
import { getContrastTextColor } from '../../utils/color'

// Extraído de QuickAccessLinks.jsx para poder reusarlo también en
// MatchAdmin.jsx (y cualquier otro panel futuro con links para copiar).
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
    <div className="min-w-0">
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="w-full min-w-0 truncate rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/70 outline-none"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl transition text-sm font-medium hover:brightness-110"
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
    </div>
  )
}

export default CopyField
