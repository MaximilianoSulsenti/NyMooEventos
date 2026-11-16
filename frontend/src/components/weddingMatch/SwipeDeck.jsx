import { useMemo, useRef, useState } from 'react'
import { Heart, X, RotateCcw } from 'lucide-react'
import SwipeCard from './SwipeCard'

function SwipeDeck({ grid, loading, primaryColor, onLike, onPass }) {
  // "Pasar" no descarta a nadie para siempre -- solo la saca del mazo
  // ACTUAL (dismissedIds) para no verla de nuevo al toque tras deslizarla.
  // Un "me gusta" previo sí queda firme (se excluye por myAction, no entra
  // en dismissedIds), pero a quien ya pasaste podés volver a verla con el
  // botón de abajo una vez que termines el mazo.
  const [dismissedIds, setDismissedIds] = useState(() => new Set())
  const deck = useMemo(
    () => grid.filter((p) => p.myAction !== 'like' && !dismissedIds.has(p.id)),
    [grid, dismissedIds]
  )
  const passedCount = useMemo(() => grid.filter((p) => p.myAction === 'pass').length, [grid])
  const topRef = useRef(null)
  const [pending, setPending] = useState(false)

  function handleSwipeComplete(profileId, direction) {
    setPending(false)
    setDismissedIds((prev) => new Set(prev).add(profileId))
    if (direction === 'like') onLike(profileId)
    else onPass(profileId)
  }

  function revisitPassed() {
    setDismissedIds(new Set())
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
      <div className="text-center py-14 px-4 flex flex-col items-center gap-4">
        <p className="text-white/40 text-sm">
          {passedCount > 0
            ? 'Ya viste a todos los solteros disponibles por ahora.'
            : 'Ya viste a todos los solteros disponibles por ahora -- volvé más tarde, seguro se suma alguien más durante la fiesta.'}
        </p>
        {passedCount > 0 && (
          <button
            type="button"
            onClick={revisitPassed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition"
            style={{ borderColor: `${primaryColor}80`, color: primaryColor, background: `${primaryColor}15` }}
          >
            <RotateCcw className="w-4 h-4" />
            Volver a ver a quienes pasaste
          </button>
        )}
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
