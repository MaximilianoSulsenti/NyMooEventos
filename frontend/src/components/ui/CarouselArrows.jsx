import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:bg-black/40 transition-colors'

// Flechitas delicadas y consistentes para navegar carruseles de foto a mano
// (glass sutil, sin ruido visual, con un leve pop al tocarlas).
function CarouselArrows({ onPrev, onNext }) {
  return (
    <>
      <motion.button
        type="button"
        onClick={onPrev}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Foto anterior"
        className={`${arrowClass} left-2`}
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>
      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Foto siguiente"
        className={`${arrowClass} right-2`}
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </>
  )
}

export default CarouselArrows
