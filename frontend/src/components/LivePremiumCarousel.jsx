import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cloudinaryThumb } from '../utils/cloudinary'
import { identityColor } from '../utils/identityColor'

// Reemplaza al carrusel 3D (giraba en un anillo con rotateY, y sin
// backface-visibility se veía la foto reflejada al girar hacia atrás -- bug
// real, no solo estético). Acá cada foto es el MISMO elemento animado
// (key=photo._id) en sus tres posiciones -- entra chica y atenuada por la
// derecha, se agranda y enfoca al llegar al centro, y sale atenuándose
// (pero sin desaparecer de golpe) por la izquierda, simétrico a como
// entró -- como un carrusel normal. Como es la misma instancia la que
// cambia de posición (no una tarjeta fija que cambia de contenido), Framer
// Motion anima el desplazamiento solo -- se ve la foto "viniendo" de
// verdad, no un blur estático.
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

// offset relativo a la foto activa: -1 saliendo por la izquierda, 0 al
// centro (grande y nítida), 1 entrando por la derecha -- simétrico a
// propósito (misma escala/opacidad de los dos lados), como un carrusel
// normal: la que se va queda visible deslizándose, no desaparece de golpe.
const OFFSET_STYLE = {
  '-1': { x: '-62%', scale: 0.72, opacity: 0.5, blur: 2 },
  0: { x: '0%', scale: 1, opacity: 1, blur: 0 },
  1: { x: '62%', scale: 0.72, opacity: 0.5, blur: 2 },
}

function Slot({ offset, photo }) {
  const style = OFFSET_STYLE[offset]
  const isCenter = offset === 0

  return (
    <motion.div
      className="absolute w-64 h-80 sm:w-80 sm:h-[26rem] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900"
      style={{ zIndex: 10 - Math.abs(offset) }}
      initial={{ x: '110%', scale: 0.6, opacity: 0, filter: 'blur(5px)' }}
      animate={{ x: style.x, scale: style.scale, opacity: style.opacity, filter: `blur(${style.blur}px)` }}
      exit={{ x: '-110%', scale: 0.6, opacity: 0, filter: 'blur(5px)' }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
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
      {isCenter && <SlotCaption photo={photo} />}
    </motion.div>
  )
}

function LivePremiumCarousel({ photos, intervalMs = 4000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return undefined
    const interval = setInterval(() => setIndex((prev) => prev + 1), intervalMs)
    return () => clearInterval(interval)
  }, [photos.length, intervalMs])

  if (photos.length === 0) return null

  const len = photos.length
  // Ventana de 3 posiciones (-1, 0, 1), como un carrusel normal -- con pocas
  // fotos en el evento dos offsets distintos pueden caer en la misma foto
  // (ej. con 2 fotos en total), así que se descarta cualquier offset que
  // repita un índice ya usado, en vez de duplicar la key y romper la
  // animación.
  const seenIndexes = new Set()
  const visible = []
  for (const offset of [-1, 0, 1]) {
    const photoIndex = ((index + offset) % len + len) % len
    if (seenIndexes.has(photoIndex)) continue
    seenIndexes.add(photoIndex)
    visible.push({ offset, photo: photos[photoIndex] })
  }

  return (
    <div className="relative w-full h-[70vh] max-h-[620px] flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false}>
        {visible.map(({ offset, photo }) => (
          <Slot key={photo._id} offset={offset} photo={photo} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default LivePremiumCarousel
