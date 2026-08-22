import { useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../utils/cn'

// Tarjeta de vidrio oscuro y opaco de base: garantiza que el texto se lea bien
// sin importar la imagen de fondo que haya detrás (upload / moderación / stats).
function GlassPanel({ children, className, accentColor, as: Component = 'div', style, ...props }) {
  // Igual que en Button: memoizar motion.create evita remontar el subárbol
  // (y perder el foco de los inputs de adentro) en cada render.
  const MotionComponent = useMemo(() => motion.create(Component), [Component])

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative rounded-3xl border border-white/10 bg-neutral-950/75 backdrop-blur-xl shadow-2xl overflow-hidden',
        className
      )}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.6)', ...style }}
      {...props}
    >
      {accentColor && <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: accentColor }} />}
      {children}
    </MotionComponent>
  )
}

export default GlassPanel
