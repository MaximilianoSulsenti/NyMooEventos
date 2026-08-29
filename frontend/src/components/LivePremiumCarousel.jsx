import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cloudinaryThumb } from '../utils/cloudinary'
import { identityColor } from '../utils/identityColor'

// Reemplaza al carrusel 3D (giraba en un anillo con rotateY, y sin
// backface-visibility se veía la foto reflejada al girar hacia atrás -- bug
// real, no solo estético). Acá cada foto es el MISMO elemento animado
// (key=photo._id) en las cuatro posiciones -- entra chica y atenuada del
// lado derecho, se va agrandando y enfocando a medida que avanza, queda
// grande y nítida al centro, y sale atenuándose por la izquierda. Como es
// la misma instancia la que cambia de posición (no una tarjeta fija que
// cambia de contenido), Framer Motion anima el desplazamiento solo -- se ve
// la foto "viniendo" de verdad, no un blur estático estilo antes.
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
// centro (grande y nítida), 1 y 2 llegando por la derecha (cada vez más
// chicas, atenuadas y desenfocadas cuanto más lejos del centro).
const OFFSET_STYLE = {
  '-1': { x: '-90%', scale: 0.55, opacity: 0, blur: 4 },
  0: { x: '0%', scale: 1, opacity: 1, blur: 0 },
  1: { x: '48%', scale: 0.68, opacity: 0.55, blur: 2 },
  2: { x: '92%', scale: 0.52, opacity: 0.2, blur: 5 },
}

function Slot({ offset, photo }) {
  const style = OFFSET_STYLE[offset]
  const isCenter = offset === 0

  return (
    <motion.div
      className="absolute w-52 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900"
      style={{ zIndex: 10 - Math.abs(offset) }}
      initial={{ x: '100%', scale: 0.5, opacity: 0, filter: 'blur(6px)' }}
      animate={{ x: style.x, scale: style.scale, opacity: style.opacity, filter: `blur(${style.blur}px)` }}
      exit={{ x: '-100%', scale: 0.5, opacity: 0, filter: 'blur(6px)' }}
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
  // Ventana de 4 posiciones (-1, 0, 1, 2) -- con pocas fotos en el evento
  // dos offsets distintos pueden caer en la misma foto (ej. con 2 fotos en
  // total), así que se descarta cualquier offset que repita un índice ya
  // usado, en vez de duplicar la key y romper la animación.
  const seenIndexes = new Set()
  const visible = []
  for (const offset of [-1, 0, 1, 2]) {
    const photoIndex = ((index + offset) % len + len) % len
    if (seenIndexes.has(photoIndex)) continue
    seenIndexes.add(photoIndex)
    visible.push({ offset, photo: photos[photoIndex] })
  }

  return (
    <div className="relative w-full h-[62vh] max-h-[520px] flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false}>
        {visible.map(({ offset, photo }) => (
          <Slot key={photo._id} offset={offset} photo={photo} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default LivePremiumCarousel
