import { motion } from 'motion/react'
import { cn } from '../../utils/cn'

function Button({ as: Component = 'button', className, style, primaryColor, children, ...props }) {
  const MotionComponent = motion.create(Component)

  return (
    <MotionComponent
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-medium tracking-wide',
        'border border-white/10 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl',
        className
      )}
      style={{
        background: primaryColor
          ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`
          : undefined,
        color: primaryColor ? '#0a0a0a' : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export default Button
