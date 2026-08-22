import { useMemo } from 'react'

const COLORS = ['#f472b6', '#facc15', '#38bdf8', '#a855f7', '#4ade80', '#fb923c', '#f5d0fe', '#fde68a']
const SHAPES = ['rounded-full', 'rounded-sm', 'rounded-none rotate-45']

function Confetti({ count = 60 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 3.5,
        delay: Math.random() * 5,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
        width: 5 + Math.random() * 7,
        height: 8 + Math.random() * 10,
        drift: 15 + Math.random() * 30,
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-30">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`confetti-piece ${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            background: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            '--drift': `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
