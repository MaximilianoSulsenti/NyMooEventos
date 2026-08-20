import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const AUTO_ADVANCE_MS = 4000

// Carrusel 3D interactivo hecho a medida con `motion` (arrastre + perspectiva),
// inspirado en el concepto de Cult-UI. No es el paquete oficial: cult-ui.com está
// detrás de un checkpoint anti-bot que no pudimos atravesar desde este entorno.
function ThreeDPhotoCarousel({ images }) {
  const [index, setIndex] = useState(0)
  const count = images?.length || 0

  function go(direction) {
    setIndex((prev) => (prev + direction + count) % count)
  }

  useEffect(() => {
    if (count < 2) return undefined
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % count)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(interval)
  }, [index, count])

  if (count === 0) return null

  function handleDragEnd(_, info) {
    if (info.offset.x < -80) go(1)
    else if (info.offset.x > 80) go(-1)
  }

  const visibleRange = 2

  return (
    <div className="relative w-full max-w-2xl mx-auto h-72 flex items-center justify-center" style={{ perspective: 1200 }}>
      {images.map((src, i) => {
        let offset = i - index
        if (offset > images.length / 2) offset -= images.length
        if (offset < -images.length / 2) offset += images.length
        if (Math.abs(offset) > visibleRange) return null

        const isActive = offset === 0

        return (
          <motion.img
            key={src + i}
            src={src}
            alt=""
            drag={isActive ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={isActive ? handleDragEnd : undefined}
            animate={{
              x: offset * 130,
              scale: isActive ? 1 : 0.78 - Math.abs(offset) * 0.06,
              rotateY: offset * -25,
              opacity: 1 - Math.abs(offset) * 0.28,
              zIndex: 10 - Math.abs(offset),
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={() => !isActive && setIndex(i)}
            className={`absolute w-40 h-56 md:w-48 md:h-64 object-cover rounded-2xl shadow-2xl border border-white/10 ${
              isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          />
        )
      })}

      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-0 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-0 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ThreeDPhotoCarousel
