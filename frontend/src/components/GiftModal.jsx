import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Copy, Check, Landmark } from 'lucide-react'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

function GiftModal({ config, primaryColor = '#a855f7', onClose }) {
  useLockBodyScroll()
  const [copied, setCopied] = useState(false)
  const light = shadeColor(primaryColor, 25)
  const dark = shadeColor(primaryColor, -25)

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl p-px w-full max-w-md shadow-2xl"
          style={{ background: `linear-gradient(160deg, ${light}90, transparent 45%, ${dark}70)` }}
        >
          <div className="bg-neutral-900 text-white rounded-[calc(1.5rem-1px)] p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

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
            <p className="text-neutral-400 text-sm text-center mb-6 break-words">
              {config.customMessage || 'Gracias de corazón por pensar en nosotros.'}
            </p>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500 text-sm shrink-0">{row.label}</span>
                  <span className="text-white text-sm font-medium text-right truncate min-w-0">{row.value}</span>
                </div>
              ))}

              <div className={rows.length > 0 ? 'pt-3 border-t border-white/10' : ''}>
                <p className="text-neutral-500 text-sm mb-1.5">Alias / CBU</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <p className="w-full min-w-0 truncate rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm font-mono text-white">
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GiftModal
