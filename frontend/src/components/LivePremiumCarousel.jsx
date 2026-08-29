import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cloudinaryThumb } from '../utils/cloudinary'
import { identityColor } from '../utils/identityColor'

// Reemplaza al carrusel 3D (giraba en un anillo con rotateY) -- sin
// perspectiva ni rotación: la foto activa al centro, grande y nítida, con
// dos "compañeras" achicadas y atenuadas a los costados dando sensación de
// profundidad -- como una pila de fotos, no una rueda. Evita de raíz el bug
// del 3D (una cara sin backface-visibility se ve reflejada al girar hacia
// atrás), porque acá ninguna tarjeta gira: solo entran/salen con fade.
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

function PhotoCard({ photo }) {
  return (
    <>
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
    </>
  )
}

// side: 'left' | 'center' | 'right' -- define tamaño, opacidad y desplazamiento
// de cada tarjeta, siempre plana (sin rotar), solo con fade+scale al entrar.
const SIDE_STYLES = {
  left: { x: '-72%', scale: 0.72, opacity: 0.4, blur: 2, z: 1 },
  center: { x: '0%', scale: 1, opacity: 1, blur: 0, z: 2 },
  right: { x: '72%', scale: 0.72, opacity: 0.4, blur: 2, z: 1 },
}

function Slot({ side, photo }) {
  const { x, scale, opacity, blur, z } = SIDE_STYLES[side]
  return (
    <motion.div
      className="absolute w-52 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900"
      style={{ zIndex: z, filter: blur ? `blur(${blur}px)` : undefined }}
      animate={{ x, scale, opacity }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <AnimatePresence mode="wait">
        {photo && (
          <motion.div
            key={photo._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <PhotoCard photo={photo} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LivePremiumCarousel({ photos, intervalMs = 4000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return undefined
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % photos.length), intervalMs)
    return () => clearInterval(interval)
  }, [photos.length, intervalMs])

  if (photos.length === 0) return null

  const len = photos.length
  const left = len > 2 ? photos[(index - 1 + len) % len] : null
  const center = photos[index % len]
  const right = len > 1 ? photos[(index + 1) % len] : null

  return (
    <div className="relative w-full h-[62vh] max-h-[520px] flex items-center justify-center">
      {left && <Slot side="left" photo={left} />}
      <Slot side="center" photo={center} />
      {right && <Slot side="right" photo={right} />}
    </div>
  )
}

export default LivePremiumCarousel
