import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import UploadPhotosForm from './UploadPhotosForm'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

function UploadPhotosModal({ eventSlug, primaryColor, allowVideos, onClose }) {
  useLockBodyScroll()

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
          className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold text-center mb-4">Subí tus fotos</h2>
          <UploadPhotosForm eventSlug={eventSlug} primaryColor={primaryColor} allowVideos={allowVideos} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UploadPhotosModal
