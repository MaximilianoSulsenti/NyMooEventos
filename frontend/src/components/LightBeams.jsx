import { useMemo } from 'react'

const COLORS = ['#f472b6', '#38bdf8', '#a855f7', '#facc15', '#4ade80']

function LightBeams({ count = 5 }) {
  const beams = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        duration: 6 + Math.random() * 4,
        delay: (i / count) * 3,
        left: (i / count) * 100,
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-20">
      {beams.map((beam) => (
        <span
          key={beam.id}
          className="light-beam"
          style={{
            left: `${beam.left}%`,
            background: `linear-gradient(180deg, transparent, ${beam.color}, transparent)`,
            animationDuration: `${beam.duration}s`,
            animationDelay: `${beam.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default LightBeams
