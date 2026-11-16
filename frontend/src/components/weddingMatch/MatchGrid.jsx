import { motion } from 'motion/react'
import { Heart, X, HeartHandshake } from 'lucide-react'

function MatchGrid({ grid, loading, primaryColor, onLike, onPass }) {
  if (loading && grid.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (grid.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <p className="text-white/40 text-sm">
          Todavía sos de los primeros solteros en llegar -- ¡compartí la voz, más gente se va a ir sumando durante la fiesta!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {grid.map((profile) => (
        <motion.div
          key={profile.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-[3/4]"
        >
          <img src={profile.photoUrl} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {profile.matched && (
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-sm" style={{ color: primaryColor }}>
              <HeartHandshake className="w-3 h-3" />
              Match
            </span>
          )}

          <div className="absolute bottom-0 inset-x-0 p-2.5">
            <p className="text-white text-sm font-semibold truncate">
              {profile.name}, {profile.age}
            </p>
            {profile.vibes?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.vibes.map((v) => (
                  <span key={v} className="px-1.5 py-0.5 rounded-full bg-white/15 text-white/80 text-[10px] leading-none">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!profile.matched && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              {profile.myAction === 'like' ? (
                <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/70">
                  Te gusta
                </span>
              ) : (
                <>
                  {/* Pasar queda siempre reversible -- aunque ya la hayas
                      pasado antes, los botones siguen ahí para que puedas
                      cambiar de opinión y darle "me gusta" más tarde, en
                      vez de quedar descartada para siempre. */}
                  <button
                    type="button"
                    onClick={() => onPass(profile.id)}
                    aria-label="Pasar"
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm text-white/70 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLike(profile.id)}
                    aria-label="Me gusta"
                    className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition"
                    style={{ background: `${primaryColor}cc`, color: '#fff' }}
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default MatchGrid
