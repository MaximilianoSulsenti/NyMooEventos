import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, MessageCircle, PartyPopper } from 'lucide-react'
import Confetti from '../Confetti'
import Button from '../ui/Button'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { buildWaLink, MATCH_ACCENT } from '../../utils/weddingMatch'

// createPortal envuelve a AnimatePresence desde AFUERA, nunca al revés --
// AnimatePresence filtra sus hijos con isValidElement, que da false para
// un ReactPortal, así que si el portal queda ADENTRO el contenido
// desaparece en silencio (mismo gotcha documentado en
// ThreeDPhotoCarousel.jsx y RsvpModalShell.jsx).
function MatchCelebration({ myName, myPhotoUrl, eventName, match, onClose }) {
  useLockBodyScroll()

  return createPortal(
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(10, 5, 15, 0.92)' }}
        >
          <Confetti count={70} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm"
          >
            <motion.p
              initial={{ scale: 0.6 }}
              animate={{ scale: [0.6, 1.15, 1] }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: MATCH_ACCENT.pink }}
            >
              <PartyPopper className="w-6 h-6" style={{ color: MATCH_ACCENT.violet }} />
              ¡Es un Match!
            </motion.p>

            <div className="flex items-center -space-x-4">
              <img src={myPhotoUrl} alt={myName} className="w-24 h-24 rounded-full object-cover border-4 border-neutral-950 shadow-xl" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: MATCH_ACCENT.gradient }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </motion.span>
              <img
                src={match.photoUrl}
                alt={match.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-neutral-950 shadow-xl"
              />
            </div>

            <p className="text-white text-lg">
              Vos y <span className="font-semibold">{match.name}</span> se gustaron mutuamente
            </p>

            {match.whatsapp ? (
              <Button
                as="a"
                href={buildWaLink(match.whatsapp, myName, eventName)}
                target="_blank"
                rel="noreferrer"
                gradient={MATCH_ACCENT.gradient}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4" />
                Escribirle por WhatsApp
              </Button>
            ) : (
              <p className="text-white/50 text-sm">¡Buscalo/a en la pista de baile o en la barra! 🕺💃</p>
            )}

            <button type="button" onClick={onClose} className="text-white/40 text-sm hover:text-white transition">
              Seguir viendo perfiles
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MatchCelebration
