import { motion, useScroll, useSpring } from 'motion/react'

// Barra fija de progreso de lectura: se llena de 0 a 100% a medida que se
// hace scroll por toda la tarjeta digital. useSpring suaviza el avance para
// que no se sienta a los saltos con cada frame de scroll.
function ScrollProgressBar({ color = '#a855f7' }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-left pointer-events-none"
      style={{ scaleX, background: color, boxShadow: `0 0 8px ${color}80` }}
    />
  )
}

export default ScrollProgressBar
