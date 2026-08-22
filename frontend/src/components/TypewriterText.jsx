import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [0, 0, 1, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', times: [0, 0.5, 0.5, 1] }}
      className="inline-block h-[0.9em] w-[2px] translate-y-[0.1em] bg-white ml-0.5"
    />
  )
}

function TypewriterText({ text, className }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest))
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    count.set(0)
    setIsTyping(true)
    const duration = Math.min(1.6, 0.3 + text.length * 0.035)
    const controls = animate(count, text.length, {
      type: 'tween',
      duration,
      ease: 'easeOut',
      onComplete: () => setIsTyping(false),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <p className={className}>
      <motion.span>{displayText}</motion.span>
      {isTyping && <BlinkingCursor />}
    </p>
  )
}

export default TypewriterText
