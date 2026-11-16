import { useMemo, useRef, useState } from 'react'
import { Heart, X } from 'lucide-react'
import SwipeCard from './SwipeCard'

function SwipeDeck({ grid, loading, primaryColor, onLike, onPass }) {
  const deck = useMemo(() => grid.filter((p) => !p.myAction), [grid])
  const topRef = useRef(null)
  const [pending, setPending] = useState(false)

  function handleSwipeComplete(profileId, direction) {
    setPending(false)
    if (direction === 'like') onLike(profileId)
    else onPass(profileId)
  }

  function triggerButton(direction) {
    if (!topRef.current || pending) return
    setPending(true)
    topRef.current.fling(direction)
  }

  if (loading && deck.length === 0) {
    return <div className="aspect-[3/4.2] rounded-3xl bg-white/5 animate-pulse" />
  }

  if (deck.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <p className="text-white/40 text-sm">
          Ya viste a todos los solteros disponibles por ahora -- volvé más tarde, seguro se suma alguien más durante la fiesta.
        </p>
      </div>
    )
  }

  const visible = deck.slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      <div className="relative aspect-[3/4.2] w-full">
        {visible.map((profile, i) => (
          <SwipeCard
            key={profile.id}
            ref={i === 0 ? topRef : undefined}
            profile={profile}
            primaryColor={primaryColor}
            active={i === 0}
            stackIndex={i}
            onSwipeComplete={handleSwipeComplete}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => triggerButton('pass')}
          aria-label="Pasar"
          className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 border border-white/15 text-white/70 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => triggerButton('like')}
          aria-label="Me gusta"
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition"
          style={{ background: primaryColor, color: '#fff' }}
        >
          <Heart className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}

export default SwipeDeck
