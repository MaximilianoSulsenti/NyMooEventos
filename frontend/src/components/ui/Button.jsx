import { useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../utils/cn'
import { shadeColor, getContrastTextColor } from '../../utils/color'

function Button({ as: Component = 'button', className, style, primaryColor, children, ...props }) {
  // motion.create debe memoizarse: si se recrea en cada render, React trata el
  // resultado como un componente distinto y remonta todo el subárbol (por eso
  // los inputs dentro de un Button/formulario perdían el foco al tipear).
  const MotionComponent = useMemo(() => motion.create(Component), [Component])

  const baseClassName = cn(
    'inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-medium tracking-wide transition-shadow duration-200',
    className
  )

  if (!primaryColor) {
    return (
      <MotionComponent
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn('border border-white/10 shadow-xl backdrop-blur-sm hover:shadow-2xl', baseClassName)}
        style={style}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }

  const light = shadeColor(primaryColor, 20)
  const dark = shadeColor(primaryColor, -22)
  const textColor = getContrastTextColor(primaryColor)

  return (
    <span
      className="inline-block rounded-full p-px"
      style={{ background: `linear-gradient(180deg, ${light}80, transparent 65%, ${dark}40)` }}
    >
      <MotionComponent
        whileHover={{ scale: 1.03, filter: 'brightness(1.08)' }}
        whileTap={{ scale: 0.97 }}
        className={baseClassName}
        style={{
          background: `linear-gradient(180deg, ${light}, ${primaryColor} 45%, ${dark})`,
          boxShadow: `inset 0 1px 0 ${light}aa, inset 0 -2px 4px ${dark}90, 0 4px 16px -4px ${primaryColor}66`,
          color: textColor,
          ...style,
        }}
        {...props}
      >
        {children}
      </MotionComponent>
    </span>
  )
}

export default Button
