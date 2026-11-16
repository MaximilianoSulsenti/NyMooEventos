import { useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../utils/cn'
import { shadeColor, getContrastTextColor } from '../../utils/color'

function Button({ as: Component = 'button', className, style, primaryColor, gradient, children, ...props }) {
  // motion.create debe memoizarse: si se recrea en cada render, React trata el
  // resultado como un componente distinto y remonta todo el subárbol (por eso
  // los inputs dentro de un Button/formulario perdían el foco al tipear).
  const MotionComponent = useMemo(() => motion.create(Component), [Component])

  const baseClassName = cn(
    'inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-medium tracking-wide transition-shadow duration-200',
    className
  )

  // `gradient`: un CSS background ya armado (ej. el degradado violeta->rosa
  // de Wedding Match, MATCH_ACCENT.gradient) en vez de un solo hex del que
  // derivar luz/sombra -- para marcas que necesitan DOS colores fijos a la
  // vez, no una variación tonal de uno solo. Todo pasa por un único <button>
  // renderizado abajo (en vez de tres `return` separados) para que
  // MotionComponent se use en un solo lugar del JSX.
  let outerRingBackground = null
  let innerStyle = style

  if (gradient) {
    outerRingBackground = 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent 65%, rgba(0,0,0,0.35))'
    innerStyle = {
      background: gradient,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 20px -4px rgba(139,92,246,0.55)',
      color: '#ffffff',
      ...style,
    }
  } else if (primaryColor) {
    const light = shadeColor(primaryColor, 20)
    const dark = shadeColor(primaryColor, -22)
    outerRingBackground = `linear-gradient(180deg, ${light}80, transparent 65%, ${dark}40)`
    innerStyle = {
      background: `linear-gradient(180deg, ${light}, ${primaryColor} 45%, ${dark})`,
      boxShadow: `inset 0 1px 0 ${light}aa, inset 0 -2px 4px ${dark}90, 0 4px 16px -4px ${primaryColor}66`,
      color: getContrastTextColor(primaryColor),
      ...style,
    }
  }

  const button = (
    <MotionComponent
      whileHover={outerRingBackground ? { scale: 1.03, filter: 'brightness(1.08)' } : { scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={outerRingBackground ? baseClassName : cn('border border-white/10 shadow-xl backdrop-blur-sm hover:shadow-2xl', baseClassName)}
      style={innerStyle}
      {...props}
    >
      {children}
    </MotionComponent>
  )

  if (!outerRingBackground) return button

  return (
    <span className="inline-block rounded-full p-px" style={{ background: outerRingBackground }}>
      {button}
    </span>
  )
}

export default Button
