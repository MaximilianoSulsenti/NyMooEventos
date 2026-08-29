import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform } from 'motion/react'

// Adaptado del componente oficial three-d-carousel de Cult-UI (cult-ui.com),
// convertido de TS/Next a JS plano y conectado a las fotos reales del evento
// (la demo original usaba imágenes de placeholder de picsum.photos).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useMediaQuery(query, { defaultValue = false, initializeWithValue = true } = {}) {
  const isServer = typeof window === 'undefined'

  function getMatches(q) {
    if (isServer) return defaultValue
    return window.matchMedia(q).matches
  }

  const [matches, setMatches] = useState(() => (initializeWithValue ? getMatches(query) : defaultValue))

  function handleChange() {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()
    matchMedia.addEventListener('change', handleChange)
    return () => matchMedia.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

const AUTO_ROTATE_SPEED = 0.05 // grados por frame
const AUTO_ROTATE_RESUME_DELAY = 700 // ms tras soltar el arrastre

const transition = { duration: 0.15, ease: [0.32, 0.72, 0, 1] }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(({ handleClick, controls, cards, isCarouselActive, onDragStateChange }) => {
  const isScreenSizeSm = useMediaQuery('(max-width: 640px)')
  const cylinderWidth = isScreenSizeSm ? 1100 : 1800
  const faceCount = cards.length
  const faceWidth = cylinderWidth / faceCount
  const radius = cylinderWidth / (2 * Math.PI)
  const rotation = useMotionValue(0)
  const transform = useTransform(rotation, (value) => `rotate3d(0, 1, 0, ${value}deg)`)

  useEffect(() => {
    if (!isCarouselActive) return undefined
    let frameId
    function tick() {
      if (onDragStateChange.canAutoRotate()) {
        rotation.set(rotation.get() - AUTO_ROTATE_SPEED)
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isCarouselActive, onDragStateChange, rotation])

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <motion.div
        drag={isCarouselActive ? 'x' : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{ transform, rotateY: rotation, width: cylinderWidth, transformStyle: 'preserve-3d' }}
        onDragStart={() => onDragStateChange.pause()}
        onDrag={(_, info) => isCarouselActive && rotation.set(rotation.get() + info.offset.x * 0.05)}
        onDragEnd={(_, info) => {
          if (!isCarouselActive) return
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: { type: 'spring', stiffness: 100, damping: 30, mass: 0.1 },
          })
          onDragStateChange.resumeLater()
        }}
        animate={controls}
      >
        {/* Este carrusel solo se usa para la galería estática de los
            novios (ver sections/Gallery.jsx) -- `images` es un array fijo
            que se carga una sola vez, no un feed en vivo que va agregando
            fotos (ese caso lo resuelve components/LivePremiumCarousel.jsx,
            un componente aparte, sin rotación 3D). Por eso acá el ángulo/radio va directo en `style`,
            como en el componente original de Cult-UI: fijar la posición
            con `animate`+`transition` fue un ajuste pensado para el feed
            en vivo que terminó aplicado por error a este archivo, y le
            cambiaba el look-and-feel original (las tarjetas quedaban
            "reacomodándose" con easing en vez de fijas en su lugar). */}
        {cards.map((imgUrl, i) => (
          <motion.div
            key={imgUrl}
            className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
            }}
            onClick={() => handleClick(imgUrl, i)}
          >
            <motion.img
              src={imgUrl}
              alt=""
              loading="lazy"
              layoutId={`img-${imgUrl}`}
              className="pointer-events-none w-full rounded-xl object-cover aspect-square"
              initial={{ filter: 'blur(4px)' }}
              layout="position"
              animate={{ filter: 'blur(0px)' }}
              transition={transition}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
})
Carousel.displayName = 'Carousel'

function ThreeDPhotoCarousel({ images }) {
  const [activeImg, setActiveImg] = useState(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  const resumeAtRef = useRef(0)

  const dragState = useRef({
    canAutoRotate: () => Date.now() > resumeAtRef.current,
    pause: () => {
      resumeAtRef.current = Infinity
    },
    resumeLater: () => {
      resumeAtRef.current = Date.now() + AUTO_ROTATE_RESUME_DELAY
    },
  }).current

  function handleClick(imgUrl) {
    setActiveImg(imgUrl)
    setIsCarouselActive(false)
    controls.stop()
  }

  function handleClose() {
    setActiveImg(null)
    setIsCarouselActive(true)
  }

  if (!images || images.length === 0) return null

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 m-5 md:m-24 rounded-3xl"
            style={{ willChange: 'opacity' }}
            transition={transitionOverlay}
          >
            <motion.img
              layoutId={`img-${activeImg}`}
              src={activeImg}
              alt=""
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'transform' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[360px] md:h-[420px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={images}
          isCarouselActive={isCarouselActive}
          onDragStateChange={dragState}
        />
      </div>
    </motion.div>
  )
}

export default ThreeDPhotoCarousel
