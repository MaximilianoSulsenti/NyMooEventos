import { motion, useReducedMotion } from 'motion/react'

// float=true hace que el ícono quede flotando suavemente en bucle una vez que
// terminó de entrar, para que la tarjeta se sienta viva en vez de estática.
function AnimatedIcon({ icon: Icon, className, iconClassName = 'w-4 h-4', style, delay = 0, float = true }) {
  const reduceMotion = useReducedMotion()
  const shouldFloat = float && !reduceMotion

  return (
    <motion.span
      initial={{ scale: 0, rotate: -25, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.15, rotate: 8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay }}
      className={className}
      style={style}
    >
      <motion.span
        className="inline-flex"
        animate={shouldFloat ? { y: [0, -4, 0] } : undefined}
        transition={shouldFloat ? { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: delay + 0.6 } : undefined}
      >
        <Icon className={iconClassName} />
      </motion.span>
    </motion.span>
  )
}

export default AnimatedIcon
