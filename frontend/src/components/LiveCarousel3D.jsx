import { AnimatePresence, motion } from 'motion/react'
import { cloudinaryThumb } from '../utils/cloudinary'
import { identityColor } from '../utils/identityColor'

// Carrusel 3D propio (reemplaza al de Cult-UI, que no estaba pensado para un
// feed en vivo que va agregando fotos constantemente) -- diseñado para eso
// desde cero: en vez de recalcular el ángulo de TODAS las tarjetas cada vez
// que cambia la cantidad de fotos (lo que causaba los saltos y el reblur
// general), acá hay una cantidad FIJA de "posiciones" en el anillo. Cada
// posición tiene un ángulo que nunca cambia; solo la foto que le toca a esa
// posición cambia con el tiempo, y esa transición es un simple crossfade.
const SLOT_COUNT = 10
const RADIUS = 380
const ROTATION_SECONDS = 50

function SlotCaption({ photo }) {
  if (!photo.comment && !photo.guestName) return null
  const color = photo.guestName ? identityColor(photo.guestName) : null

  return (
    <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
      {photo.guestName && (
        <p className="text-xs font-bold truncate drop-shadow" style={{ color: color || '#fff' }}>
          {photo.guestName}
        </p>
      )}
      {photo.comment && <p className="text-white text-sm leading-snug line-clamp-2 drop-shadow">{photo.comment}</p>}
    </div>
  )
}

function SlotContent({ photo }) {
  return (
    <motion.div
      key={photo._id}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900"
    >
      {photo.assetType === 'video' ? (
        <video
          src={cloudinaryThumb(photo.cloudinaryUrl, 500)}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img src={cloudinaryThumb(photo.cloudinaryUrl, 500)} alt="" className="w-full h-full object-cover" />
      )}
      <SlotCaption photo={photo} />
    </motion.div>
  )
}

function LiveCarousel3D({ photos }) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => photos[i] || null)

  return (
    <div className="relative w-full h-[62vh] max-h-[520px] flex items-center justify-center" style={{ perspective: 1800 }}>
      <motion.div
        className="relative w-52 h-72 sm:w-64 sm:h-80"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360 }}
        transition={{ duration: ROTATION_SECONDS, repeat: Infinity, ease: 'linear' }}
      >
        {slots.map((photo, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `rotateY(${(i * 360) / SLOT_COUNT}deg) translateZ(${RADIUS}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <AnimatePresence mode="wait">{photo && <SlotContent photo={photo} />}</AnimatePresence>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default LiveCarousel3D
