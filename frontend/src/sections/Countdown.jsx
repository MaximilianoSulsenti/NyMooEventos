import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { glassStyle, glassBlurClass } from '../utils/glass'
import { secondaryTextColor, titleTextStyle } from '../utils/color'

function getTimeLeft(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const SHAPE_CLASSES = {
  square: 'rounded-md bg-white/5 border border-white/10',
  circle: 'rounded-full aspect-square bg-white/5 border border-white/10',
  solid: 'rounded-xl bg-neutral-900 border border-white/10 shadow-2xl',
  none: 'rounded-none bg-transparent border-0',
}

function Countdown({ event, config, appearance, styles }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(event.date))
  const isGlass = config.shape === 'glass'
  const shape = isGlass
    ? cn('rounded-2xl border border-white/20 shadow-lg', glassBlurClass(config))
    : SHAPE_CLASSES[config.shape] || SHAPE_CLASSES.square
  const digitSize = config.fontSizeTitle || 'text-2xl'
  const labelSize = config.fontSizeSubtitle || 'text-xs'

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(event.date)), 1000)
    return () => clearInterval(interval)
  }, [event.date])

  const units = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Hs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ]

  return (
    <section className={`text-center px-6 ${styles.fontClass}`}>
      <h2 className={`text-lg ${config.subtitle ? 'mb-1' : 'mb-6'} ${styles.heading}`} style={titleTextStyle(config)}>
        {config.title || 'Cuenta regresiva'}
      </h2>
      {config.subtitle && (
        <p className="mb-6" style={{ color: secondaryTextColor(config.textColor, 'b3') }}>
          {config.subtitle}
        </p>
      )}
      <div className="flex justify-center gap-4">
        {units.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className={cn(shape, 'px-4 py-3 min-w-[64px] flex flex-col items-center justify-center')}
            style={isGlass ? glassStyle(config) : undefined}
          >
            <p className={`${digitSize} font-semibold`} style={{ color: appearance.primaryColor }}>
              {String(unit.value).padStart(2, '0')}
            </p>
            <p className={`${labelSize} mt-1`} style={{ color: config.labelColor || 'rgba(255,255,255,0.5)' }}>
              {unit.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Countdown
