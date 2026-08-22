import { motion } from 'motion/react'

function AnimatedIcon({ icon: Icon, className, iconClassName = 'w-4 h-4', style, delay = 0 }) {
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
      <Icon className={iconClassName} />
    </motion.span>
  )
}

export default AnimatedIcon
