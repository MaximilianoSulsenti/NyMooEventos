import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Copy, Check } from 'lucide-react'
import QrCode from './dashboard/QrCode'
import Button from './ui/Button'
import { BRAND } from '../utils/brand'
import { shadeColor } from '../utils/color'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

function UploadAccessModal({ eventSlug, onClose }) {
  useLockBodyScroll()
  const uploadUrl = `${window.location.origin}/evento/${eventSlug}/upload`
  const [copied, setCopied] = useState(false)
  const light = shadeColor(BRAND.blue, 25)
  const dark = shadeColor(BRAND.blue, -25)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(uploadUrl)
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
          className="rounded-3xl p-px w-full max-w-sm shadow-2xl"
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

          <h2 className="text-lg font-semibold text-center mb-1">Acceso invitados</h2>
          <p className="text-neutral-400 text-sm text-center mb-6">
            Compartí este link o QR para que suban sus fotos.
          </p>

          <div className="flex justify-center mb-6">
            <QrCode value={uploadUrl} />
          </div>

          <Button type="button" onClick={handleCopy} primaryColor={BRAND.blue} className="w-full">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Enlace copiado' : 'Copiar enlace de subida'}
          </Button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UploadAccessModal
