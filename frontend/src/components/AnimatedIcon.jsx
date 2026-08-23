import { motion, useReducedMotion } from 'motion/react'

// float=true hace que el ícono quede flotando suavemente en bucle una vez que
// terminó de entrar, para que la tarjeta se sienta viva en vez de estática.
// El "vaivén" combina un bob vertical con una leve rotación en un período
// distinto (desincronizados a propósito) para que se sienta orgánico en vez
// de un rebote mecánico prolijo.
function AnimatedIcon({ icon: Icon, className, iconClassName = 'w-4 h-4', style, delay = 0, float = true }) {
  const reduceMotion = useReducedMotion()
  const shouldFloat = float && !reduceMotion
  // El brillo del hover toma el mismo color que ya se le pasó al badge
  // (background/color), así el "glow" siempre hace juego sin pedir un prop
  // aparte.
  const glowColor = style?.color

  return (
    <motion.span
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.16,
        rotate: 8,
        boxShadow: glowColor ? `0 0 0 1px ${glowColor}40, 0 0 22px 3px ${glowColor}55` : undefined,
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay }}
      className={className}
      style={style}
    >
      <motion.span
        className="inline-flex"
        animate={shouldFloat ? { y: [0, -4, 0], rotate: [0, -4, 3, 0] } : undefined}
        transition={
          shouldFloat
            ? {
                y: { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: delay + 0.6 },
                rotate: { repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: delay + 0.6 },
              }
            : undefined
        }
      >
        <Icon className={iconClassName} />
      </motion.span>
    </motion.span>
  )
}

export default AnimatedIcon
