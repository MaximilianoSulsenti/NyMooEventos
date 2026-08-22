import { useMemo } from 'react'

const EMOJIS = ['🎉', '🥳', '🎊', '🍾', '💃', '🕺', '✨']

function EmojiRain({ count = 24 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 6,
        size: 20 + Math.random() * 20,
        drift: 20 + Math.random() * 40,
        emoji: EMOJIS[i % EMOJIS.length],
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-30">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="emoji-piece"
          style={{
            left: `${piece.left}%`,
            fontSize: piece.size,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            '--drift': `${piece.drift}px`,
          }}
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  )
}

export default EmojiRain
