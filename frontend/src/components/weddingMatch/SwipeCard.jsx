import { forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'motion/react'

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 500
const FLING_DISTANCE = 600

// Mismo vocabulario de drag que ThreeDPhotoCarousel.jsx: useMotionValue +
// useTransform para el valor derivado (rotate sigue a x solo), y
// useAnimation/controls.start para animar esa MISMA motion value desde
// afuera (fling o vuelta al centro) -- Framer la reconoce como ya-externa
// vía `style` y la anima igual, sin pelear con el drag.
const SwipeCard = forwardRef(function SwipeCard({ profile, primaryColor, active, stackIndex, onSwipeComplete }, ref) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-18, 18])
  const likeOpacity = useTransform(x, [20, 140], [0, 1])
  const passOpacity = useTransform(x, [-140, -20], [1, 0])
  const controls = useAnimation()

  async function fling(direction) {
    const target = direction === 'like' ? FLING_DISTANCE : -FLING_DISTANCE
    await controls.start({ x: target, opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } })
    onSwipeComplete(profile.id, direction)
  }

  useImperativeHandle(ref, () => ({ fling }))

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      fling('like')
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      fling('pass')
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } })
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={active ? { x, rotate, touchAction: 'none', zIndex: 10 } : { zIndex: 10 - stackIndex }}
      initial={false}
      animate={active ? controls : { scale: 1 - stackIndex * 0.05, y: stackIndex * 12, opacity: stackIndex > 2 ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      drag={active ? 'x' : false}
      dragElastic={0.7}
      onDragEnd={active ? handleDragEnd : undefined}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
        <img
          src={profile.photoUrl}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        {active && (
          <>
            <motion.span
              style={{ opacity: likeOpacity, borderColor: primaryColor, color: primaryColor }}
              className="absolute top-6 left-6 px-3 py-1.5 rounded-xl border-2 text-sm font-bold uppercase tracking-wide"
            >
              Me gusta
            </motion.span>
            <motion.span
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 px-3 py-1.5 rounded-xl border-2 border-white/70 text-white/70 text-sm font-bold uppercase tracking-wide"
            >
              Paso
            </motion.span>
          </>
        )}

        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className="text-white text-lg font-semibold">
            {profile.name}, {profile.age}
          </p>
          {profile.vibes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {profile.vibes.map((v) => (
                <span key={v} className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[11px]">
                  {v}
                </span>
              ))}
            </div>
          )}
          {profile.bio && <p className="text-white/60 text-xs mt-1.5 line-clamp-2">{profile.bio}</p>}
        </div>
      </div>
    </motion.div>
  )
})

export default SwipeCard
