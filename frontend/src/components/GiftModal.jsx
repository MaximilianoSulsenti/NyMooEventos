import { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Check, Landmark } from 'lucide-react'
import { secondaryTextColor, shadeColor } from '../utils/color'
import RsvpModalShell from './RsvpModalShell'

function GiftModal({ config, primaryColor = '#a855f7', onClose }) {
  const [copied, setCopied] = useState(false)
  const bg = config.modalBgColor || '#171717'
  const textColor = config.modalTextColor || '#ffffff'
  const mutedColor = secondaryTextColor(config.modalTextColor, '99')
  const boxBg = shadeColor(bg, 12)

  const rows = [
    { label: 'Titular', value: config.holderName },
    { label: 'Banco', value: config.bankName },
  ].filter((row) => row.value)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(config.cbuAlias || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <RsvpModalShell accentColor={primaryColor} bgColor={config.modalBgColor} textColor={config.modalTextColor} onClose={onClose}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: `${primaryColor}22`, color: primaryColor }}
      >
        <Landmark className="w-7 h-7" />
      </motion.div>

      <h2 className="text-xl font-semibold text-center mb-1">Datos para tu regalo</h2>
      <p className="text-sm text-center mb-6 break-words" style={{ color: mutedColor }}>
        {config.customMessage || 'Gracias de corazón por pensar en nosotros.'}
      </p>

      <div className="rounded-2xl p-4 space-y-3" style={{ background: boxBg, border: `1px solid ${textColor}1a` }}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="text-sm shrink-0" style={{ color: mutedColor }}>
              {row.label}
            </span>
            <span className="text-sm font-medium text-right truncate min-w-0" style={{ color: textColor }}>
              {row.value}
            </span>
          </div>
        ))}

        <div className={rows.length > 0 ? 'pt-3' : ''} style={rows.length > 0 ? { borderTop: `1px solid ${textColor}1a` } : undefined}>
          <p className="text-sm mb-1.5" style={{ color: mutedColor }}>
            Alias / CBU
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <p
              className="w-full min-w-0 truncate rounded-xl px-3 py-2 text-sm font-mono"
              style={{ background: shadeColor(bg, 22), border: `1px solid ${textColor}1a`, color: textColor }}
            >
              {config.cbuAlias}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium shrink-0 flex items-center justify-center gap-1.5 transition"
              style={{ background: copied ? '#22c55e' : primaryColor, color: '#ffffff' }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </RsvpModalShell>
  )
}

export default GiftModal
